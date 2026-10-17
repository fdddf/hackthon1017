export type Checkpoint = {
  id: string;
  label: string;
  icon: string;
  points: number;
  target: string;
  place: string;
};

export type CheckIn = { at: string; place: string };

export type Place = { id: string; label: string; x: number; y: number; far: boolean };

/** Field names match the seeded week on the server exactly — see server/state.js. */
export type Day = {
  day: string;
  mood: string;
  movedAt: string | null;
  wake: string;
  left: string;
  home: string;
  move: string | null;
  homework: string;
  read: string | null;
  screens: string;
  sleep: string;
  [key: string]: string | null;
};

export type Skill = { name: string; why: string };

export type Turn =
  | { role: 'parent'; text: string }
  | {
      role: 'claude';
      unprompted?: boolean;
      answer?: string;
      evidence?: string[];
      tonight?: string;
      skill?: Skill;
      headline?: string;
      body?: string;
    };

export type Nudge = { text: string; from: string; at: string; acked: boolean };

export type HistoryItem = { when: string; question: string; gist: string };

export type KidTurn = { question: string; say: string | null; plan: string[] };

export type TempoState = {
  child: { name: string; age: number };
  parent: { name: string; language: string };
  checkpoints: Checkpoint[];
  today: Record<string, CheckIn>;
  mood: 'good' | 'ok' | 'rough' | null;
  points: number;
  streak: number;
  nudge: Nudge | null;
  thread: Turn[];
  thinking: boolean;
  history: HistoryItem[];
  kid: KidTurn | null;
  kidThinking: boolean;
  call: 'idle' | 'ringing' | 'video' | 'audio';
  callMode: 'video' | 'audio';
  week: Day[];
};

export const PLACES: Place[] = [
  { id: 'home', label: 'Home', x: 205, y: 206, far: false },
  { id: 'school', label: 'School', x: 120, y: 134, far: false },
  { id: 'park', label: 'The park', x: 320, y: 262, far: false },
  { id: 'hall', label: 'Sports hall', x: 545, y: 62, far: true },
];

export const REWARDS = [
  { cost: 120, label: '20 minutes of football with Dad' },
  { cost: 180, label: 'You pick the Saturday film' },
  { cost: 250, label: 'A whole afternoon, just you and Mum' },
];

export const PARENT_STARTERS = [
  { key: 'slower', text: 'Is he getting slower, or is something else going on?' },
  { key: 'bedtime', text: 'Why is bedtime sliding?' },
  { key: 'where', text: 'Where is he on the days he gets home late?' },
];

export const KID_STARTERS = [
  "I've got football and homework. Which first?",
  "I'm too tired to read tonight.",
  'How do I get more points?',
];

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'ar', label: 'العربية' },
  { code: 'uk', label: 'Українська' },
  { code: 'de', label: 'Deutsch' },
] as const;
