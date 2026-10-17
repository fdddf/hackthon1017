// Relay keeps one family in memory. No database, no accounts — see docs PRD §12.
// The server is authoritative so the watch and the phone can never disagree on stage.

export const DEMO_PROBLEM = {
  subject: 'Maths — word problem',
  title: 'Question 4',
  text:
    'A baker has 48 bread rolls. He packs them into bags of 6. ' +
    'He sells 5 bags in the morning and 2 bags in the afternoon. ' +
    'How many rolls does he have left?',
  language: 'de', // the worksheet is in German in the real demo; text kept English for judges
};

export function freshState() {
  return {
    child: { name: 'Mert', age: 10 },
    parent: { name: 'Ayşe', language: 'en' },

    // --- the current homework session -------------------------------------
    problem: DEMO_PROBLEM,
    active: false,
    persistSeconds: 0, // the Persistence Ring. Rewards not quitting, not being right.

    // --- the help ladder: dot 1 = hint, dot 2 = hint, dot 3 = a human ------
    rungsUsed: 0, // 0..3
    hints: [], // { level, hint, spoken }
    escalated: false,
    card: null, // CoachingCard, appears on the parent's phone

    // --- call -------------------------------------------------------------
    call: 'idle', // idle | ringing | connected

    // --- the rest of the watch -------------------------------------------
    points: 120,
    quest: {
      title: 'Read the question twice before you calculate',
      why: 'Mum noticed you solve fast but sometimes answer a different question.',
      points: 15,
      done: false,
    },
    mood: null, // 'good' | 'ok' | 'rough'

    // --- what the Observer reads -----------------------------------------
    events: [],
  };
}

export const REWARDS = [
  { cost: 100, label: '20 minutes of football with Dad' },
  { cost: 150, label: 'You pick the Saturday film' },
  { cost: 200, label: 'Stay up 30 minutes later on Friday' },
];
