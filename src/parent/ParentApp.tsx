import { useEffect, useRef, useState } from 'react';
import { useRelay } from '../lib/bus';
import { useCall } from '../lib/call';
import { PlaceMap, WeekChart, WeekTable } from '../lib/viz';
import {
  LANGUAGES,
  PARENT_STARTERS,
  PLACES,
  type TempoState,
  type Turn,
} from '../lib/types';

type Send = (m: Record<string, unknown>) => void;
type Signal = (h: ((payload: unknown) => void) | null) => void;
type Tab = 'ask' | 'week' | 'map' | 'history';

// ── Ask ──────────────────────────────────────────────────────────────────────

function Starters({ send, compact = false }: { send: Send; compact?: boolean }) {
  return (
    <div className="chips">
      {PARENT_STARTERS.map((s) => (
        <button
          key={s.key}
          className="chip"
          onClick={() => send({ type: 'ask', question: s.text })}
        >
          {s.text}
        </button>
      ))}
      {!compact && (
        <button className="chip" onClick={() => send({ type: 'noticed' })}>
          What did you notice this week?
        </button>
      )}
    </div>
  );
}

function ClaudeTurn({ turn }: { turn: Extract<Turn, { role: 'claude' }> }) {
  return (
    <>
      {turn.unprompted ? (
        <div className="pcard">
          <h5>What I noticed</h5>
          <p className="lead-line">{turn.headline}</p>
          <p>{turn.body}</p>
        </div>
      ) : (
        <div className="pcard">
          <h5>From his check-ins</h5>
          <p>{turn.answer}</p>
          {turn.evidence && (
            <ul className="evi">
              {turn.evidence.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="pcard alert">
        <h5>Tonight, 15 minutes</h5>
        <p>{turn.tonight}</p>
      </div>

      {turn.skill && (
        <div className="skillcard">
          <h5>What made that question work</h5>
          <p>
            <strong>{turn.skill.name}</strong>
          </p>
          <p className="try">{turn.skill.why}</p>
        </div>
      )}
    </>
  );
}

function AskTab({ state, send }: { state: TempoState; send: Send }) {
  const [draft, setDraft] = useState('');
  const last = state.thread[state.thread.length - 1];
  const hasAnswer = last && last.role === 'claude';

  const submit = () => {
    const q = draft.trim();
    if (!q || state.thinking) return;
    send({ type: 'ask', question: q });
    setDraft('');
  };

  return (
    <>
      {state.thread.length === 0 && !state.thinking && (
        <div className="pcard">
          <h5>Where to start</h5>
          <p className="muted">
            {state.parent.name} has never used an AI for anything. These are the questions
            she might actually type.
          </p>
          <Starters send={send} />
        </div>
      )}

      {state.thread.map((turn, i) =>
        turn.role === 'parent' ? (
          <div className="bubble-parent" key={i}>
            {turn.text}
          </div>
        ) : (
          <ClaudeTurn turn={turn} key={i} />
        ),
      )}

      {state.thinking && <div className="thinking">reading five days of check-ins…</div>}

      {hasAnswer && !state.thinking && (
        <>
          <div className="pcard">
            <h5>Reach him</h5>
            <button
              className="sendbtn"
              disabled={Boolean(state.nudge)}
              onClick={() =>
                send({ type: 'nudge:send', intention: (last as { tonight?: string }).tonight })
              }
            >
              {state.nudge ? 'Sent to his watch' : 'Send tonight’s suggestion to his watch'}
            </button>
            <div className="callrow">
              <button className="callvid" onClick={() => send({ type: 'call:ring', mode: 'video' })}>
                Video call
              </button>
              <button className="callaud" onClick={() => send({ type: 'call:ring', mode: 'audio' })}>
                Audio call
              </button>
            </div>
          </div>
          <div className="pcard">
            <h5>Ask something else</h5>
            <Starters send={send} compact />
          </div>
        </>
      )}

      <div className="askbar">
        <input
          id="parent-question"
          className="askinput"
          value={draft}
          placeholder="Ask about Mert in your own words…"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <button className="asksend" onClick={submit} disabled={!draft.trim() || state.thinking}>
          Ask
        </button>
      </div>
    </>
  );
}

// ── Week · Map · History ─────────────────────────────────────────────────────

function WeekTab({ state }: { state: TempoState }) {
  return (
    <>
      <div className="pcard viz-root">
        <h5>Five evenings</h5>
        <div className="chartwrap">
          <WeekChart week={state.week} compact />
        </div>
        <p className="muted">Tuesday and Thursday don’t just end later — they start later.</p>
      </div>
      <div className="pcard">
        <h5>The same week, as numbers</h5>
        <div className="tablewrap datatable">
          <WeekTable week={state.week} />
        </div>
      </div>
    </>
  );
}

function MapTab({ state }: { state: TempoState }) {
  return (
    <>
      <div className="pcard">
        <h5>Pins, not a trail</h5>
        <PlaceMap places={PLACES} week={state.week} />
        <p className="muted">
          Only places attached to a tap he made. There is no “where is he now” in this app.
        </p>
      </div>
      <div className="pcard alert">
        <h5>The ninety minutes</h5>
        <p>
          On Tue and Thu he moves at the sports hall across town instead of the park four
          streets away. About 35 minutes each way.
        </p>
      </div>
    </>
  );
}

function HistoryTab({ state, send }: { state: TempoState; send: Send }) {
  return (
    <>
      <div className="pcard">
        <h5>Earlier conversations</h5>
        {state.history.map((h) => (
          <button
            key={h.when}
            className="histrow"
            onClick={() => send({ type: 'ask', question: h.question })}
          >
            <span className="when2">{h.when}</span>
            <span className="what">
              {h.question}
              <em>{h.gist}</em>
            </span>
          </button>
        ))}
      </div>
      <div className="pcard">
        <h5>Why this matters</h5>
        <p>
          Fourteen weeks of questions and answers, kept. <strong>This isn’t a chat
          session — it’s a record of a childhood she can scroll back through.</strong>
        </p>
      </div>
    </>
  );
}

// ── the call ─────────────────────────────────────────────────────────────────

function CallStage({ state, send, onSignal }: { state: TempoState; send: Send; onSignal: Signal }) {
  const { stream, error, start, hangUp } = useCall('parent', send, onSignal);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wasIdle = useRef(true);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  // Open the media as soon as the parent rings, so the peer is ready when he answers.
  useEffect(() => {
    if (state.call === 'ringing' && wasIdle.current) {
      wasIdle.current = false;
      void start(state.callMode === 'audio' ? 'audio' : 'video');
    }
    if (state.call === 'idle') wasIdle.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.call]);

  if (state.call === 'idle') return null;

  return (
    <div className="callstage">
      {state.call === 'video' ? (
        <video ref={videoRef} className="vid" autoPlay playsInline muted />
      ) : (
        <div className="vid placeholder">{state.call === 'ringing' ? '···' : '🎧'}</div>
      )}
      <div className="cs">
        <b>
          {state.call === 'ringing'
            ? `Ringing ${state.child.name}’s watch…`
            : `Connected — ${state.call}`}
        </b>
        {error ? (
          <span className="offline">Media unavailable: {error}</span>
        ) : (
          'The week stays on screen while you talk.'
        )}
      </div>
      <button
        className="hang"
        onClick={() => {
          send({ type: 'call:end' });
          hangUp();
        }}
      >
        End
      </button>
    </div>
  );
}

// ── the app ──────────────────────────────────────────────────────────────────

const TITLES: Record<Tab, string> = {
  ask: 'Ask about Mert',
  week: 'His week',
  map: 'Where his taps happened',
  history: 'Everything you’ve asked',
};

export function ParentApp() {
  const { state, connected, send, onSignal } = useRelay('parent');
  const [tab, setTab] = useState<Tab>('ask');

  if (!state) {
    return (
      <div className="phone-shell">
        <div className="phone-screen">
          <div className="waiting">{connected ? 'Loading…' : 'Connecting…'}</div>
        </div>
      </div>
    );
  }

  const done = Object.keys(state.today).length;

  return (
    <div className="phone-shell">
      <div className="phone-screen">
        <div className="phone-head">
          <h2>{TITLES[tab]}</h2>
          <span className="pill">
            {done} check-ins today · {state.history.length * 3 + 2} weeks of history
          </span>
          <div className="ptabs">
            {(['ask', 'week', 'map', 'history'] as const).map((t) => (
              <button key={t} aria-selected={tab === t} onClick={() => setTab(t)}>
                {t === 'ask' ? 'Ask' : t === 'week' ? 'Week' : t === 'map' ? 'Map' : 'History'}
              </button>
            ))}
          </div>
          <CallStage state={state} send={send} onSignal={onSignal} />
        </div>

        <div className="phone-body">
          {tab === 'ask' && <AskTab state={state} send={send} />}
          {tab === 'week' && <WeekTab state={state} />}
          {tab === 'map' && <MapTab state={state} />}
          {tab === 'history' && <HistoryTab state={state} send={send} />}

          {tab === 'ask' && state.thread.length > 0 && (
            <div className="pcard">
              <h5>Read this in</h5>
              <div className="langs">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    data-on={state.parent.language === l.code}
                    onClick={() => send({ type: 'language', value: l.code })}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
