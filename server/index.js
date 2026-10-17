import 'dotenv/config';
import express from 'express';
import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import { freshState, REWARDS } from './state.js';
import { brake, translate, observe, quest } from './claude.js';

const PORT = Number(process.env.PORT ?? 8787);
const app = express();
app.use(express.json({ limit: '12mb' })); // worksheets arrive as base64 photos

let state = freshState();
const clients = new Set(); // { socket, role }

// --- plumbing ---------------------------------------------------------------

function broadcast() {
  const msg = JSON.stringify({ type: 'state', state });
  for (const c of clients) {
    if (c.socket.readyState === 1) c.socket.send(msg);
  }
}

function log(kind, detail = {}) {
  state.events.push({ kind, at: Date.now(), ...detail });
}

/** Relay a WebRTC signal to everyone except the sender. */
function relaySignal(from, payload) {
  const msg = JSON.stringify({ type: 'rtc', payload });
  for (const c of clients) {
    if (c.socket !== from && c.socket.readyState === 1) c.socket.send(msg);
  }
}

// The Persistence Ring. One tick a second while the child is on a problem.
setInterval(() => {
  if (!state.active) return;
  state.persistSeconds += 1;
  broadcast();
}, 1000);

// --- the three jobs Claude does, driven by watch events ---------------------

async function pullRung() {
  if (state.rungsUsed >= 3) return;
  state.rungsUsed += 1;

  if (state.rungsUsed <= 2) {
    // Job 1 — THE BRAKE. One hint. Never the answer.
    const hint = await brake({
      problem: state.problem,
      level: state.rungsUsed,
      previousHints: state.hints,
    });
    state.hints.push({ level: state.rungsUsed, ...hint });
    log('hint', { level: state.rungsUsed });
  } else {
    // Rung 3 is not an AI. It is a parent.
    // Job 2 — THE TRANSLATOR. The stuck moment becomes something Mum can act on.
    state.escalated = true;
    log('escalated', { afterSeconds: state.persistSeconds });
    broadcast(); // light the phone up immediately; the card can take a second
    state.card = await translate({
      problem: state.problem,
      language: state.parent.language,
      hintsAlreadyTried: state.hints,
      persistSeconds: state.persistSeconds,
    });
  }
  broadcast();
}

// --- websocket --------------------------------------------------------------

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (socket, req) => {
  const role = new URL(req.url, 'http://x').searchParams.get('role') ?? 'watch';
  const client = { socket, role };
  clients.add(client);
  socket.send(JSON.stringify({ type: 'state', state }));

  socket.on('message', async (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    switch (msg.type) {
      case 'start':
        state.active = true;
        log('started');
        break;

      case 'stuck':
        await pullRung();
        return; // pullRung broadcasts

      case 'quest:set': {
        // The parent says what they want; Claude makes it something a child can hold.
        const made = await quest({ goal: String(msg.goal ?? ''), child: state.child });
        state.quest = { ...made, done: false };
        log('quest:set');
        break;
      }

      case 'quest:done':
        if (!state.quest.done) {
          state.quest.done = true;
          state.points += state.quest.points;
          log('quest:done');
        }
        break;

      case 'mood':
        state.mood = msg.value;
        log('mood', { value: msg.value });
        break;

      case 'redeem': {
        const reward = REWARDS.find((r) => r.label === msg.label);
        if (reward && state.points >= reward.cost) {
          state.points -= reward.cost;
          log('redeem', { label: reward.label });
        }
        break;
      }

      case 'call:ring':
        state.call = 'ringing';
        break;
      case 'call:accept':
        state.call = 'connected';
        log('call:connected');
        break;
      case 'call:end':
        state.call = 'idle';
        break;

      case 'rtc':
        relaySignal(socket, msg.payload);
        return; // signalling is not app state

      case 'language':
        state.parent.language = msg.value;
        if (state.escalated) {
          // re-translate the card into the parent's language
          state.card = await translate({
            problem: state.problem,
            language: msg.value,
            hintsAlreadyTried: state.hints,
            persistSeconds: state.persistSeconds,
          });
        }
        break;

      case 'reset':
        state = freshState();
        break;
    }
    broadcast();
  });

  socket.on('close', () => clients.delete(client));
});

// --- http -------------------------------------------------------------------

app.get('/api/health', (_req, res) =>
  res.json({ ok: true, hasKey: Boolean(process.env.ANTHROPIC_API_KEY) }),
);

app.get('/api/rewards', (_req, res) => res.json(REWARDS));

// Job 3 — THE OBSERVER. Patterns in learning behaviour, never a score.
app.post('/api/patterns', async (_req, res) => {
  try {
    res.json(await observe({ child: state.child, events: state.events }));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

server.listen(PORT, () => {
  console.log(`\n  Relay server  →  http://localhost:${PORT}`);
  console.log(`  watch  →  http://localhost:5173/watch`);
  console.log(`  parent →  http://localhost:5173/parent`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('\n  ⚠ No ANTHROPIC_API_KEY — running on bundled fallback cards.\n');
  }
});
