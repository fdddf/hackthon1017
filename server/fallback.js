// Bundled answers for when there is no API key, a call fails, or the venue wifi
// dies mid-demo. These are real Claude outputs from the seeded week, captured and
// frozen — so the fallback path is indistinguishable from the live one on stage.

export const FALLBACK_ANSWER = {
  answer:
    "He isn't getting slower. On Mon, Wed and Fri he starts homework by 18:35 and sleeps by 21:10. On Tue and Thu he gets home near 18:50, starts at 21:40/21:50 and taps 'rough'. My guess, and it is only a guess: whatever keeps him out until 18:50 on those two days uses up his evening.",
  evidence: [
    'Mon/Wed/Fri: home 17:05-17:12, homework 18:20-18:35, sleep 21:00-21:10',
    'Tue/Thu: home 18:50/18:48, homework 21:40/21:50, sleep 22:25/22:30',
    'Tue/Thu: no move, no read, mood rough. Mon/Wed/Fri: park, good/ok',
  ],
  tonight:
    'Before bed, ask him: "What\'s the best and worst part of your Tuesdays?" Then just listen for five minutes.',
  skill: {
    name: 'Offer two possible explanations',
    why: "You asked 'slower, or something else?', which gave the data two stories to test. Only one of them fit. That turned a worry into a question with an answer, and you can do the same whenever you ask an AI about any pattern.",
  },
};

export const FALLBACK_NOTICED = {
  headline: 'Hall days push his whole evening late',
  body:
    'Mert’s week splits in two: park days and hall days. On Tuesday and Thursday he got home near 18:50, started homework at 21:40 or later, and slept around 22:30, and both days were rough. On park days homework started by 18:35 and he was asleep by 21:10.',
  tonight:
    'Spend ten minutes asking Mert what the worst part of a hall evening feels like, and pick one small thing to move earlier together.',
};

export const FALLBACK_NUDGE = {
  text: 'Hey Mert, what are Tuesdays like these days? Tell me the best bit and the weirdest bit.',
};

export const KID_FALLBACK = {
  say: "Homework first. It's nearly 19:00, and last Tuesday 'after' turned into 21:40. Get it done, then football's free with nothing waiting.",
  plan: ['18:55  homework', '19:40  football', '20:40  wind down', '21:00  bed'],
};

export const KID_STARTERS = [
  "I've got football and homework. Which first?",
  "I'm too tired to read tonight.",
  'How do I get more points?',
];

export const STARTER_QUESTIONS = [
  'Is he getting slower, or is something else going on?',
  'Why is bedtime sliding?',
  'Where is he on the days he gets home late?',
  'What did you notice this week?',
];
