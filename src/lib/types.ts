export type Hint = { level: number; hint: string; spoken: string };

export type CoachingCard = {
  subject: string;
  concept: string;
  answer: { value: string; working: string };
  ladder: { question: string; lookingFor: string }[];
  unlockLine: string;
  aiSkill: { name: string; tryThis: string };
};

export type Patterns = { finding: string; evidence: string[]; tonight: string };

export type RelayState = {
  child: { name: string; age: number };
  parent: { name: string; language: string };
  problem: { subject: string; title: string; text: string; language: string };
  active: boolean;
  persistSeconds: number;
  rungsUsed: number;
  hints: Hint[];
  escalated: boolean;
  card: CoachingCard | null;
  call: 'idle' | 'ringing' | 'connected';
  points: number;
  quest: { title: string; why: string; points: number; done: boolean };
  mood: 'good' | 'ok' | 'rough' | null;
  events: { kind: string; at: number }[];
};

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'ar', label: 'العربية' },
  { code: 'uk', label: 'Українська' },
  { code: 'de', label: 'Deutsch' },
] as const;
