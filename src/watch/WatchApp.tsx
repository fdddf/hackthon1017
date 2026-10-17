import { useState } from 'react';
import { useRelay } from '../lib/bus';
import { useCall } from '../lib/call';
import { REWARDS, type TempoState } from '../lib/types';

type Send = (m: Record<string, unknown>) => void;

/** How much of the day's shape is filled in. Not a score — a shape. */
function DayRing({ done, total }: { done: number; total: number }) {
  const r = 26;
  const circumference = 2 * Math.PI * r;
  const progress = total ? done / total : 0;
  return (
    <div className="ring-wrap">
      <svg className="ring" width="62" height="62" viewBox="0 0 62 62" aria-hidden="true">
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
          {done}/{total}
        </b>
        of today checked in
      </div>
    </div>
  );
}

/** A message from a parent, written by Claude in their voice. Not a reminder. */
function NudgeCard({ state, send }: { state: TempoState; send: Send }) {
  if (!state.nudge) return null;
  return (
    <div className={`nudge ${state.nudge.acked ? 'acked' : ''}`}>
      <small>
        {state.nudge.from} · {state.nudge.at}
      </small>
      {state.nudge.text}
      {!state.nudge.acked && (
        <button className="watch-btn ghost" onClick={() => send({ type: 'nudge:ack' })}>
          OK
        </button>
      )}
    </div>
  );
}

function Today({ state, send }: { state: TempoState; send: Send }) {
  const done = Object.keys(state.today).length;
  const next = state.checkpoints.find((c) => !state.today[c.id]);

  return (
    <>
      <div className="watch-top">
        <span>TODAY</span>
        <span className="streak">{state.streak} days</span>
      </div>

      <DayRing done={done} total={state.checkpoints.length} />
      <NudgeCard state={state} send={send} />

      {state.checkpoints.map((c) => {
        const at = state.today[c.id];
        const late = at && at > c.target;
        return (
          <button
            key={c.id}
            className={`cp ${at ? 'done' : ''}`}
            disabled={Boolean(at)}
            onClick={() => send({ type: 'checkin', id: c.id })}
          >
            <span className="cp-icon">{c.icon}</span>
            <span className="cp-label">{c.label}</span>
            <span className={`cp-time ${late ? 'late' : ''}`}>{at ?? `+${c.points}`}</span>
          </button>
        );
      })}

      {next && (
        <div className="watch-action">
          <button className="watch-btn" onClick={() => send({ type: 'checkin', id: next.id })}>
            {next.icon} {next.label}
          </button>
        </div>
      )}
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

/** The child can see the deal. Nothing is collected that isn't on this screen. */
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
          <button key={m.key} data-on={state.mood === m.key} onClick={() => send({ type: 'mood', value: m.key })}>
            {m.face}
          </button>
        ))}
      </div>

      <p className="watch-label">What Mum can see</p>
      <div className="seen-item">The times you tapped today</div>
      <div className="seen-item">Which ones you skipped</div>
      <div className="seen-item">The face you picked</div>
      <div className="seen-item">Your points and your streak</div>
      <div className="seen-item no">Not where you are</div>
      <div className="seen-item no">Not your messages</div>
      <div className="seen-item no">Not anything else, ever</div>
    </>
  );
}

export function WatchApp() {
  const { state, connected, send, onSignal } = useRelay('watch');
  const [tab, setTab] = useState<'today' | 'points' | 'me'>('today');
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

  const ringing = state.call === 'ringing';

  return (
    <div className="watch-shell">
      <div className="watch-face">
        <div className="watch-scroll">
          {state.call === 'connected' ? (
            <div className="oncall">
              <p className="watch-label">On a call</p>
              <p className="watch-problem">{state.parent.name} is here.</p>
              <div className="watch-action">
                <button className="watch-btn danger" onClick={() => send({ type: 'call:end' })}>
                  End
                </button>
              </div>
            </div>
          ) : (
            <>
              {tab === 'today' && <Today state={state} send={send} />}
              {tab === 'points' && <Points state={state} send={send} />}
              {tab === 'me' && <Me state={state} send={send} />}
              {ringing && (
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
          {(['today', 'points', 'me'] as const).map((t) => (
            <button key={t} data-on={tab === t} onClick={() => setTab(t)}>
              {t === 'today' ? 'Today' : t === 'points' ? 'Points' : 'Me'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
