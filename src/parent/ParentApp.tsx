import { useEffect, useRef, useState } from 'react';
import { useRelay } from '../lib/bus';
import { useCall } from '../lib/call';
import { LANGUAGES, type Patterns, type RelayState } from '../lib/types';

/**
 * The answer is collapsed and takes two clicks, with friction copy in between.
 * We make it hard for the PARENT to cheat — that is the whole thesis.
 */
function Answer({ value, working }: { value: string; working: string }) {
  const [step, setStep] = useState<0 | 1 | 2>(0);

  if (step === 2) {
    return (
      <div className="revealed">
        <p className="v">{value}</p>
        <p className="w">{working}</p>
      </div>
    );
  }
  return (
    <div className="locked">
      {step === 0 ? (
        <>
          <p>The answer is in here.</p>
          <button className="btn" onClick={() => setStep(1)}>
            Show me the answer
          </button>
        </>
      ) : (
        <>
          <p>
            <strong>Sure?</strong> Try the three questions first — he gets there himself about
            half the time.
          </p>
          <button className="btn" onClick={() => setStep(2)}>
            Yes, show it
          </button>
        </>
      )}
    </div>
  );
}

function Tonight({ state }: { state: RelayState }) {
  const mins = Math.floor(state.persistSeconds / 60);
  return (
    <div className="card">
      <h3>Tonight</h3>
      <p className="timeline">
        <b>{state.child.name}</b> is on <b>{state.problem.title}</b>. He stayed with it for{' '}
        <b>
          {mins} min {state.persistSeconds % 60}s
        </b>{' '}
        and used <b>{Math.min(state.rungsUsed, 2)} of 2 hints</b>
        {state.escalated ? ' before asking for you.' : '. He has not asked for you yet.'}
      </p>
    </div>
  );
}

/** The Translator, pointing the other way: a parent's goal becomes a child's task. */
function Goal({ state, send }: { state: RelayState; send: (m: Record<string, unknown>) => void }) {
  const [goal, setGoal] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="card">
      <h3>What do you want for him this week?</h3>
      <p className="step-look" style={{ marginTop: 0, marginBottom: 10 }}>
        Say it how you'd say it to a friend. We'll turn it into one thing he can finish today.
      </p>
      <input
        className="goal-input"
        value={goal}
        placeholder="He rushes and answers the wrong question"
        onChange={(e) => {
          setGoal(e.target.value);
          setSent(false);
        }}
      />
      <button
        className="btn wide"
        style={{ marginTop: 10 }}
        disabled={!goal.trim()}
        onClick={() => {
          send({ type: 'quest:set', goal });
          setSent(true);
        }}
      >
        {sent ? 'Sent to his watch' : 'Send to his watch'}
      </button>
      <div className="quest-preview">
        <strong>On his watch now:</strong> {state.quest.title}
      </div>
    </div>
  );
}

function Card({ state, send }: { state: RelayState; send: (m: Record<string, unknown>) => void }) {
  if (!state.escalated) {
    return (
      <div className="waiting">
        <div className="dot" />
        {state.child.name} is working. We will only interrupt you if he runs out of hints.
      </div>
    );
  }
  if (!state.card) {
    return (
      <div className="card alert">
        <h3>He asked for you</h3>
        <p>Writing your coaching card…</p>
      </div>
    );
  }

  const card = state.card;
  return (
    <>
      <div className="card alert">
        <h3>He asked for you</h3>
        <p>
          <strong>{card.subject}.</strong> Two hints did not get him there.
        </p>
      </div>

      <div className="card">
        <h3>What this is really testing</h3>
        <p>{card.concept}</p>
      </div>

      <Answer value={card.answer.value} working={card.answer.working} />

      <div className="card">
        <h3>Ask him these, in order</h3>
        {card.ladder.map((step, i) => (
          <div className="step" key={i}>
            <div className="step-n">{i + 1}</div>
            <div>
              <p className="step-q">{step.question}</p>
              <p className="step-look">{step.lookingFor}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>If he's still stuck after question 2</h3>
        <p>"{card.unlockLine}"</p>
      </div>

      <div className="skill">
        <h3>The AI skill you just used</h3>
        <p>
          <strong>{card.aiSkill.name}</strong>
        </p>
        <p className="try">{card.aiSkill.tryThis}</p>
      </div>

      <div className="card">
        <h3>Read this card in</h3>
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
    </>
  );
}

function PatternsTab({ state }: { state: RelayState }) {
  const [data, setData] = useState<Patterns | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/patterns', { method: 'POST' });
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !data) return <div className="waiting">Reading this week…</div>;
  if (!data) return <div className="waiting">No pattern yet.</div>;

  return (
    <>
      <div className="card">
        <h3>This week</h3>
        <p>{data.finding}</p>
        <ul className="evidence">
          {data.evidence.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      </div>
      <div className="card alert">
        <h3>Tonight, 15 minutes</h3>
        <p>{data.tonight}</p>
      </div>
      <div className="card">
        <h3>What we never look at</h3>
        <p className="step-look">
          Location, audio, messages, screen time, or anything {state.child.name} does outside a
          homework session. He can see this list on his watch.
        </p>
      </div>
    </>
  );
}

type Signal = (h: ((payload: unknown) => void) | null) => void;

function CallBar({ state, send, onSignal }: { state: RelayState; send: (m: Record<string, unknown>) => void; onSignal: Signal }) {
  const { stream, error, start, hangUp } = useCall('parent', send, onSignal);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  if (!state.escalated) return null;

  return (
    <div className="callbar">
      {state.call === 'connected' && <video ref={videoRef} autoPlay playsInline muted />}
      <div className="state">
        {error ? (
          <span className="offline">Call unavailable: {error}</span>
        ) : state.call === 'connected' ? (
          'Connected. Read question 1 off this screen.'
        ) : state.call === 'ringing' ? (
          'Ringing his watch…'
        ) : (
          'He is out of hints. You are rung three.'
        )}
      </div>
      {state.call === 'idle' ? (
        <button
          className="btn primary"
          style={{ width: 'auto' }}
          onClick={() => {
            send({ type: 'call:ring' });
            void start();
          }}
        >
          Call
        </button>
      ) : (
        <button
          className="btn danger"
          onClick={() => {
            send({ type: 'call:end' });
            hangUp();
          }}
        >
          End
        </button>
      )}
    </div>
  );
}

export function ParentApp() {
  const { state, connected, send, onSignal } = useRelay('parent');
  const [tab, setTab] = useState<'tonight' | 'patterns'>('tonight');

  if (!state) {
    return (
      <div className="phone-shell">
        <div className="phone-screen">
          <div className="waiting">{connected ? 'Loading…' : 'Connecting…'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="phone-shell">
      <div className="phone-screen">
        <div className="phone-head">
          <h2>{state.child.name}</h2>
          <p>
            {state.escalated ? (
              <span className="pill live">Needs you</span>
            ) : (
              <span className="pill">Working</span>
            )}
          </p>
          <div className="tabs">
            <button data-on={tab === 'tonight'} onClick={() => setTab('tonight')}>
              Tonight
            </button>
            <button data-on={tab === 'patterns'} onClick={() => setTab('patterns')}>
              Patterns
            </button>
          </div>
        </div>

        <div className="phone-body">
          {tab === 'tonight' ? (
            <>
              <Tonight state={state} />
              <Card state={state} send={send} />
              <Goal state={state} send={send} />
            </>
          ) : (
            <PatternsTab state={state} />
          )}
        </div>

        <CallBar state={state} send={send} onSignal={onSignal} />
      </div>
    </div>
  );
}
