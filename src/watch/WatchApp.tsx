import { useState } from 'react';
import { useRelay } from '../lib/bus';
import { useCall } from '../lib/call';
import { isLate } from '../lib/viz';
import { KID_STARTERS, REWARDS, type TempoState } from '../lib/types';

type Send = (m: Record<string, unknown>) => void;

/** How much of the day's shape is filled in. A shape, not a score. */
function DayRing({ done, total }: { done: number; total: number }) {
  const r = 24;
  const circumference = 2 * Math.PI * r;
  const progress = total ? done / total : 0;
  return (
    <div className="ring-wrap">
      <svg className="ring" width="58" height="58" viewBox="0 0 58 58" aria-hidden="true">
        <circle className="ring-track" cx="29" cy="29" r={r} fill="none" strokeWidth="6" />
        <circle
          className="ring-fill"
          cx="29"
          cy="29"
          r={r}
          fill="none"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          transform="rotate(-90 29 29)"
        />
      </svg>
      <div className="ring-caption">
        <b>
          {done}/{total}
        </b>
        of today checked in
      </div>
    </div>
  );
}

/** A message from a parent, rewritten by Claude in their voice. Not a reminder. */
function NudgeCard({ state, send }: { state: TempoState; send: Send }) {
  if (!state.nudge) return null;
  return (
    <div className="nudge">
      <small>
        {state.nudge.from} · {state.nudge.at}
      </small>
      {state.nudge.text}
      {!state.nudge.acked && (
        <button className="nudge-ok" onClick={() => send({ type: 'nudge:ack' })}>
          OK
        </button>
      )}
    </div>
  );
}

function Today({ state, send }: { state: TempoState; send: Send }) {
  const done = Object.keys(state.today).length;
  return (
    <>
      <div className="watch-top">
        <span>TODAY</span>
        <span className="streak">{state.streak} days</span>
      </div>

      <DayRing done={done} total={state.checkpoints.length} />
      <NudgeCard state={state} send={send} />

      {state.checkpoints.map((c) => {
        const entry = state.today[c.id];
        return (
          <button
            key={c.id}
            className={`cp ${entry ? 'done' : ''}`}
            disabled={Boolean(entry)}
            onClick={() => send({ type: 'checkin', id: c.id })}
          >
            <span className="cp-icon">{c.icon}</span>
            <span className="cp-label">
              {c.label}
              {entry && <span className="cp-where">◉ {entry.place}</span>}
            </span>
            <span className={`cp-time ${isLate(entry?.at, c.target) ? 'late' : ''}`}>
              {entry ? entry.at : `+${c.points}`}
            </span>
          </button>
        );
      })}
    </>
  );
}

/**
 * The child's own AI. He is the second person in this family using one, and the
 * point is that it helps him think instead of doing anything for him.
 */
function Ask({ state, send }: { state: TempoState; send: Send }) {
  return (
    <>
      <p className="watch-label">Ask me anything</p>

      {state.kid?.question && <div className="kidq-sent">{state.kid.question}</div>}

      {state.kidThinking && <p className="watch-label">thinking…</p>}

      {state.kid?.say && (
        <div className="kidsay">
          <small>Your watch</small>
          {state.kid.say}
          {state.kid.plan.length > 0 && (
            <ul className="kidplan">
              {state.kid.plan.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!state.kidThinking &&
        KID_STARTERS.map((q) => (
          <button key={q} className="kidq" onClick={() => send({ type: 'kid:ask', question: q })}>
            {q}
          </button>
        ))}
    </>
  );
}

function Points({ state, send }: { state: TempoState; send: Send }) {
  return (
    <>
      <p className="watch-label">Your points</p>
      <div className="points-big">{state.points}</div>
      <p className="watch-label">Swap for time together</p>
      {REWARDS.map((r) => (
        <button
          key={r.label}
          className="reward"
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

/** The child can see the deal. Nothing exists here that he didn't tap. */
function Me({ state, send }: { state: TempoState; send: Send }) {
  const moods: { key: 'good' | 'ok' | 'rough'; face: string }[] = [
    { key: 'good', face: '🙂' },
    { key: 'ok', face: '😐' },
    { key: 'rough', face: '😞' },
  ];
  return (
    <>
      <p className="watch-label">How was today?</p>
      <div className="moods">
        {moods.map((m) => (
          <button
            key={m.key}
            aria-pressed={state.mood === m.key}
            onClick={() => send({ type: 'mood', value: m.key })}
          >
            {m.face}
          </button>
        ))}
      </div>

      <p className="watch-label">What Mum can see</p>
      <div className="seen-item">The times you tapped today</div>
      <div className="seen-item">Which ones you skipped</div>
      <div className="seen-item">The place on each tap you made</div>
      <div className="seen-item">The face you picked</div>
      <div className="seen-item">Your points and your streak</div>
      <div className="seen-item no">Not where you are right now</div>
      <div className="seen-item no">Not anywhere you didn’t tap</div>
      <div className="seen-item no">Not your messages</div>
      <div className="seen-item no">Not anything else, ever</div>
    </>
  );
}

export function WatchApp() {
  const { state, connected, send, onSignal } = useRelay('watch');
  const [tab, setTab] = useState<'today' | 'ask' | 'points' | 'me'>('today');
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

  const onCall = state.call === 'video' || state.call === 'audio';

  return (
    <div className="watch-shell">
      <div className="watch-face">
        <div className="watch-scroll">
          {onCall ? (
            <>
              <p className="watch-label">On {state.call === 'audio' ? 'an audio' : 'a video'} call</p>
              <div className="kidsay">
                <small>{state.parent.name}</small>
                She can see the same week you can.
              </div>
              <div className="watch-action">
                <button className="watch-btn danger" onClick={() => send({ type: 'call:end' })}>
                  End
                </button>
              </div>
            </>
          ) : (
            <>
              {tab === 'today' && <Today state={state} send={send} />}
              {tab === 'ask' && <Ask state={state} send={send} />}
              {tab === 'points' && <Points state={state} send={send} />}
              {tab === 'me' && <Me state={state} send={send} />}
              {state.call === 'ringing' && (
                <div className="watch-action">
                  <button className="watch-btn calling" onClick={() => send({ type: 'call:accept' })}>
                    {state.parent.name} is calling
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        <div className="watch-tabs">
          {(['today', 'ask', 'points', 'me'] as const).map((t) => (
            <button key={t} data-on={tab === t} onClick={() => setTab(t)}>
              {t === 'today' ? 'Today' : t === 'ask' ? 'Ask' : t === 'points' ? 'Points' : 'Me'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
