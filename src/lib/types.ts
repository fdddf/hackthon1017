export type Checkpoint = {
  id: string;
  label: string;
  icon: string;
  points: number;
  target: string;
};

export type Skill = { name: string; why: string };

export type Turn =
  | { role: 'parent'; text: string }
  | {
      role: 'claude';
      unprompted?: boolean;
      // a direct answer
      answer?: string;
      evidence?: string[];
      tonight?: string;
      skill?: Skill;
      // an unprompted read
      headline?: string;
      body?: string;
    };

export type Nudge = { text: string; from: string; at: string; acked: boolean };

export type Day = {
  day: string;
  mood: string;
  [key: string]: string | null;
};

export type TempoState = {
  child: { name: string; age: number };
  parent: { name: string; language: string };
  checkpoints: Checkpoint[];
  today: Record<string, string>;
  mood: 'good' | 'ok' | 'rough' | null;
  points: number;
  streak: number;
  nudge: Nudge | null;
  thread: Turn[];
  thinking: boolean;
  call: 'idle' | 'ringing' | 'connected';
  week: Day[];
};

export const REWARDS = [
  { cost: 120, label: '20 minutes of football with Dad' },
  { cost: 180, label: 'You pick the Saturday film' },
  { cost: 250, label: 'A whole afternoon, just you and Mum' },
];

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'ar', label: 'العربية' },
  { code: 'uk', label: 'Українська' },
  { code: 'de', label: 'Deutsch' },
] as const;
