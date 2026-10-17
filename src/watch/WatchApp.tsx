import { useEffect, useRef, useState } from 'react';
import { useRelay, speak } from '../lib/bus';
import { useCall } from '../lib/call';
import type { RelayState } from '../lib/types';

const REWARDS = [
  { cost: 100, label: '20 minutes of football with Dad' },
  { cost: 150, label: 'You pick the Saturday film' },
  { cost: 200, label: 'Stay up 30 minutes later on Friday' },
];

/** Fills while they stay on the problem. Rewards not quitting, not being right. */
function PersistenceRing({ seconds }: { seconds: number }) {
  const goal = 600; // ten minutes is a lot for a ten-year-old
  const r = 26;
  const circumference = 2 * Math.PI * r;
  const progress = Math.min(seconds / goal, 1);
  const mins = Math.floor(seconds / 60);
  const secs = String(seconds % 60).padStart(2, '0');

  return (
    <div className="ring-wrap">
      <svg className="ring" width="62" height="62" viewBox="0 0 62 62">
        <circle className="ring-track" cx="31" cy="31" r={r} fill="none" strokeWidth="6" />
        <circle
          className="ring-fill"
          cx="31"
          cy="31"
          r={r}
          fill="none"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          transform="rotate(-90 31 31)"
        />
      </svg>
      <div className="ring-caption">
        <b>
          {mins}:{secs}
        </b>
        you stayed with it
      </div>
    </div>
  );
}

/** Two hints, then a person. Visible before they ask — that is the point. */
function HelpLadder({ used }: { used: number }) {
  return (
    <div className="rungs">
      <div className={`rung ${used >= 1 ? 'spent' : ''}`} />
      <div className={`rung ${used >= 2 ? 'spent' : ''}`} />
      <div className={`rung human ${used >= 3 ? 'spent' : ''}`} title="Mum">
        MUM
      </div>
    </div>
  );
}

function Now({ state, send }: { state: RelayState; send: (m: Record<string, unknown>) => void }) {
  const spokenRef = useRef(0);

  // A child reading a hint and a child hearing a hint are not the same child.
  useEffect(() => {
    const latest = state.hints[state.hints.length - 1];
    if (latest && state.hints.length > spokenRef.current) {
      spokenRef.current = state.hints.length;
      speak(latest.spoken);
    }
  }, [state.hints]);

  if (!state.active) {
    return (
      <>
        <p className="watch-label">Homework</p>
        <p className="watch-problem">{state.problem.title} is waiting for you.</p>
        <div className="watch-action">
          <button className="watch-btn" onClick={() => send({ type: 'start' })}>
            Start
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="watch-top">
        <span>{state.problem.title}</span>
        <HelpLadder used={state.rungsUsed} />
      </div>

      <p className="watch-problem">{state.problem.text}</p>
      <PersistenceRing seconds={state.persistSeconds} />

      {state.hints.map((h) => (
        <div className="hint" key={h.level}>
          <small>Hint {h.level}</small>
          {h.hint}
        </div>
      ))}

      <div className="watch-action">
        {state.escalated ? (
          state.call === 'connected' ? (
            <div className="hint">
              <small>On a call</small>
              Mum is here. Tell her what the question is asking.
            </div>
          ) : (
            <button
              className="watch-btn calling"
              onClick={() => send({ type: 'call:accept' })}
              disabled={state.call === 'idle'}
            >
              {state.call === 'ringing' ? 'Mum is calling — answer' : 'Mum has been told'}
            </button>
          )
        ) : (
          <button className="watch-btn" onClick={() => send({ type: 'stuck' })}>
            {state.rungsUsed === 2 ? 'Still stuck — ask Mum' : "I'm stuck"}
          </button>
        )}
      </div>
    </>
  );
}

function Quest({ state, send }: { state: RelayState; send: (m: Record<string, unknown>) => void }) {
  return (
    <>
      <p className="watch-label">Today</p>
      <div className="quest">
        {state.quest.title}
        <br />
        <em>{state.quest.why}</em>
      </div>
      <button
        className="watch-btn"
        disabled={state.quest.done}
        onClick={() => send({ type: 'quest:done' })}
      >
        {state.quest.done ? `+${state.quest.points} done` : `Done · +${state.quest.points}`}
      </button>
    </>
  );
}

function Points({ state, send }: { state: RelayState; send: (m: Record<string, unknown>) => void }) {
  return (
    <>
      <p className="watch-label">Your points</p>
      <div className="points-big">{state.points}</div>
      <p className="watch-label">Swap for time</p>
      {REWARDS.map((r) => (
        <button
          key={r.label}
          className="reward"
          style={{ background: 'none', border: 0, color: 'inherit', font: 'inherit', textAlign: 'left', width: '100%', cursor: state.points >= r.cost ? 'pointer' : 'default', opacity: state.points >= r.cost ? 1 : 0.45 }}
          disabled={state.points < r.cost}
          onClick={() => send({ type: 'redeem', label: r.label })}
        >
          <span>{r.label}</span>
          <span>{r.cost}</span>
        </button>
      ))}
    </>
  );
}

/** The child can see the deal. Nothing collected that isn't on this screen. */
function Me({ state, send }: { state: RelayState; send: (m: Record<string, unknown>) => void }) {
  const moods: { key: 'good' | 'ok' | 'rough'; face: string }[] = [
    { key: 'good', face: '🙂' },
    { key: 'ok', face: '😐' },
    { key: 'rough', face: '😞' },
  ];
  return (
    <>
      <p className="watch-label">How's it going?</p>
      <div className="moods">
        {moods.map((m) => (
          <button
            key={m.key}
            data-on={state.mood === m.key}
            onClick={() => send({ type: 'mood', value: m.key })}
          >
            {m.face}
          </button>
        ))}
      </div>

      <p className="watch-label">What Mum can see</p>
      <div className="seen-item">Which question you're on</div>
      <div className="seen-item">How long you stayed with it</div>
      <div className="seen-item">Which hints you used</div>
      <div className="seen-item">The face you tapped</div>
      <div className="seen-item no">Not where you are</div>
      <div className="seen-item no">Not your messages</div>
      <div className="seen-item no">Not anything else, ever</div>
    </>
  );
}

export function WatchApp() {
  const { state, connected, send, onSignal } = useRelay('watch');
  const [tab, setTab] = useState<'now' | 'quest' | 'points' | 'me'>('now');
  // Mounted so the watch can answer the parent's offer the moment it arrives.
  useCall('watch', send, onSignal);

  if (!state) {
    return (
      <div className="watch-shell">
        <div className="watch-face">
          <div className="watch-scroll">
            <p className="watch-label">{connected ? 'Loading' : 'Connecting…'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="watch-shell">
      <div className="watch-face">
        <div className="watch-scroll">
          {tab === 'now' && <Now state={state} send={send} />}
          {tab === 'quest' && <Quest state={state} send={send} />}
          {tab === 'points' && <Points state={state} send={send} />}
          {tab === 'me' && <Me state={state} send={send} />}
        </div>
        <div className="watch-tabs">
          {(['now', 'quest', 'points', 'me'] as const).map((t) => (
            <button key={t} data-on={tab === t} onClick={() => setTab(t)}>
              {t === 'now' ? 'Now' : t === 'quest' ? 'Task' : t === 'points' ? 'Points' : 'Me'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
