// Tempo keeps one family in memory. No database, no accounts.
// The server is authoritative so the watch and the phone can never disagree.

/** The eight moments that give a school day its shape. */
export const CHECKPOINTS = [
  { id: 'wake',    label: 'Woke up',        icon: '☀',  points: 5,  target: '07:00' },
  { id: 'left',    label: 'Left for school', icon: '🎒', points: 5,  target: '07:45' },
  { id: 'home',    label: 'Got home',        icon: '🏠', points: 5,  target: '17:10' },
  { id: 'move',    label: 'Moved my body',   icon: '⚽', points: 15, target: '17:45' },
  { id: 'homework',label: 'Started homework',icon: '✏',  points: 20, target: '18:30' },
  { id: 'read',    label: 'Read something',  icon: '📖', points: 15, target: '20:00' },
  { id: 'screens', label: 'Screens off',     icon: '🌙', points: 15, target: '20:30' },
  { id: 'sleep',   label: 'In bed',          icon: '🛏', points: 10, target: '21:00' },
];

export const REWARDS = [
  { cost: 120, label: '20 minutes of football with Dad' },
  { cost: 180, label: 'You pick the Saturday film' },
  { cost: 250, label: 'A whole afternoon, just you and Mum' },
];

/**
 * Five weekdays of real check-in times. The shape is deliberate and it is the
 * thing Claude has to find: homework always starts late, but on Tuesday and
 * Thursday he also gets home an hour and a half later. It is not laziness —
 * those two days are overloaded. A parent staring at this would see "late
 * again"; the point of the product is that Claude sees the other column.
 */
export const SEEDED_WEEK = [
  { day: 'Mon', wake: '06:58', left: '07:42', home: '17:05', move: '17:40', homework: '18:25', read: '20:05', screens: '20:35', sleep: '21:04', mood: 'good' },
  { day: 'Tue', wake: '07:01', left: '07:44', home: '18:50', move: null,    homework: '21:40', read: null,    screens: '22:10', sleep: '22:25', mood: 'rough' },
  { day: 'Wed', wake: '06:55', left: '07:40', home: '17:12', move: '17:50', homework: '18:20', read: '19:55', screens: '20:30', sleep: '21:00', mood: 'good' },
  { day: 'Thu', wake: '07:04', left: '07:46', home: '18:48', move: null,    homework: '21:50', read: null,    screens: '22:15', sleep: '22:30', mood: 'rough' },
  { day: 'Fri', wake: '06:59', left: '07:41', home: '17:08', move: '17:35', homework: '18:35', read: '20:10', screens: '20:40', sleep: '21:10', mood: 'ok' },
];

export function freshState() {
  return {
    child: { name: 'Mert', age: 10 },
    parent: { name: 'Ayşe', language: 'en' },

    // --- today on the watch ------------------------------------------------
    checkpoints: CHECKPOINTS,
    today: {}, // id -> "HH:MM"
    mood: null, // 'good' | 'ok' | 'rough'
    points: 340,
    streak: 11,

    // --- what the parent sent back to the watch ---------------------------
    nudge: null, // { text, from, at }

    // --- the conversation the parent is having with Claude ----------------
    thread: [], // { role: 'parent' | 'claude', ... }
    thinking: false,

    call: 'idle', // idle | ringing | connected

    week: SEEDED_WEEK,
  };
}

/** Minutes past midnight, for comparing a check-in against its target. */
export function toMinutes(hhmm) {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
