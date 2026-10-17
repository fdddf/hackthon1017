import 'dotenv/config';
import express from 'express';
import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import { freshState, CHECKPOINTS, PLACES, REWARDS, nowHHMM } from './state.js';
import { askAboutChild, noticed, nudge, kidAsk } from './claude.js';
import { STARTER_QUESTIONS, KID_STARTERS } from './fallback.js';

const PORT = Number(process.env.PORT ?? 8787);
const app = express();
app.use(express.json({ limit: '2mb' }));

let state = freshState();
const clients = new Set();

function broadcast() {
  const msg = JSON.stringify({ type: 'state', state });
  for (const c of clients) if (c.socket.readyState === 1) c.socket.send(msg);
}

/** Relay a WebRTC signal to everyone except the sender. */
function relaySignal(from, payload) {
  const msg = JSON.stringify({ type: 'rtc', payload });
  for (const c of clients) {
    if (c.socket !== from && c.socket.readyState === 1) c.socket.send(msg);
  }
}

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
      // --- the watch -----------------------------------------------------
      case 'checkin': {
        const point = CHECKPOINTS.find((c) => c.id === msg.id);
        if (point && !state.today[point.id]) {
          state.today[point.id] = { at: msg.at ?? nowHHMM(), place: msg.place ?? point.place };
          state.points += point.points;
        }
        break;
      }

      // The child's own AI. He is the second person in this family using one.
      case 'kid:ask': {
        const question = String(msg.question ?? '').trim();
        if (!question) break;
        state.kid = { question, say: null, plan: [] };
        state.kidThinking = true;
        broadcast();
        const said = await kidAsk({
          question,
          child: state.child,
          week: state.week,
          today: state.today,
        });
        state.kid = { question, ...said };
        state.kidThinking = false;
        break;
      }

      case 'mood':
        state.mood = msg.value;
        break;

      case 'redeem': {
        const reward = REWARDS.find((r) => r.label === msg.label);
        if (reward && state.points >= reward.cost) state.points -= reward.cost;
        break;
      }

      case 'nudge:ack':
        if (state.nudge) state.nudge.acked = true;
        break;

      // --- the phone: a parent using AI ----------------------------------
      case 'ask': {
        const question = String(msg.question ?? '').trim();
        if (!question) break;
        state.thread.push({ role: 'parent', text: question });
        state.thinking = true;
        broadcast(); // show the question immediately; the answer takes a moment

        const reply = await askAboutChild({
          question,
          child: state.child,
          week: state.week,
          today: state.today,
          language: state.parent.language,
        });
        state.thread.push({ role: 'claude', ...reply });
        state.thinking = false;
        break;
      }

      case 'noticed': {
        state.thinking = true;
        broadcast();
        const read = await noticed({
          child: state.child,
          week: state.week,
          language: state.parent.language,
        });
        state.thread.push({ role: 'claude', unprompted: true, ...read });
        state.thinking = false;
        break;
      }

      // --- remote guidance: the advice reaches the child -------------------
      case 'nudge:send': {
        const made = await nudge({
          intention: String(msg.intention ?? ''),
          child: state.child,
          parent: state.parent,
          language: state.parent.language,
        });
        state.nudge = { text: made.text, from: state.parent.name, at: nowHHMM(), acked: false };
        break;
      }

      case 'language':
        state.parent.language = msg.value;
        break;

      // --- the call --------------------------------------------------------
      case 'call:ring':
        state.callMode = msg.mode === 'audio' ? 'audio' : 'video';
        state.call = 'ringing';
        break;
      case 'call:accept':
        state.call = state.callMode;
        break;
      case 'call:end':
        state.call = 'idle';
        break;

      case 'rtc':
        relaySignal(socket, msg.payload);
        return;

      case 'reset':
        state = freshState();
        break;
    }
    broadcast();
  });

  socket.on('close', () => clients.delete(client));
});

app.get('/api/health', (_req, res) =>
  res.json({ ok: true, hasKey: Boolean(process.env.ANTHROPIC_API_KEY) }),
);
app.get('/api/rewards', (_req, res) => res.json(REWARDS));
app.get('/api/starters', (_req, res) => res.json(STARTER_QUESTIONS));
app.get('/api/kid-starters', (_req, res) => res.json(KID_STARTERS));
app.get('/api/places', (_req, res) => res.json(PLACES));

server.listen(PORT, () => {
  console.log(`\n  Tempo server  →  http://localhost:${PORT}`);
  console.log(`  stage  →  http://localhost:5173`);
  console.log(`  watch  →  http://localhost:5173/watch`);
  console.log(`  parent →  http://localhost:5173/parent`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('\n  ⚠ No ANTHROPIC_API_KEY — running on bundled fallback answers.\n');
  }
});
