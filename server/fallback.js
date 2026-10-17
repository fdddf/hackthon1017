// Bundled answers for when there is no API key, the call fails, or the venue
// wifi dies mid-demo. A clean honest demo beats a broken impressive one.
// These match the seeded week in state.js.

export const FALLBACK_ANSWER = {
  answer:
    "He isn't getting slower — his Tuesdays and Thursdays are. On Mon, Wed and Fri he's home by 17:10 and starts homework around 18:25. On Tue and Thu he gets home at 18:50 and doesn't start until 21:40. Same boy, same homework, ninety minutes less day.",
  evidence: [
    'Home: 17:05 · 18:50 · 17:12 · 18:48 · 17:08',
    'Homework started: 18:25 · 21:40 · 18:20 · 21:50 · 18:35',
    'He skipped moving his body on both late days, and both were the days he tapped the rough face',
  ],
  tonight:
    "Don't mention homework. Ask him what Tuesdays actually look like now — whether the gap between school and getting home is as long as it looks from here.",
  skill: {
    name: 'Ask about a pattern, not a person',
    why: 'You asked "is he getting slower" and gave me five days of real times. If you had asked "why is my son lazy" I would only have had your mood to work with. Dates, times and counts are what turn a worry into something an AI can actually check.',
  },
};

export const FALLBACK_NOTICED = {
  headline: 'Two days are doing all the damage',
  body:
    "Mert's week has two shapes, not one. Three days run on time and end calm. Two days — Tuesday and Thursday — he gets home 100 minutes later, skips moving, starts homework after 21:30 and goes to bed past 22:15. Those are also the only two days he tapped the rough face.",
  tonight:
    'Ask him about Tuesday, not about homework. Ten minutes, before dinner, no screens between you.',
};

export const FALLBACK_NUDGE = {
  text: "Mum here. Tuesdays look long from where I'm sitting — want to tell me about them tonight?",
};

export const KID_FALLBACK = {
  say: 'Football first — you think better after. But pick your homework time now, before you go. Last Tuesday "after" turned into 21:40.',
  plan: ['17:45  football', '19:00  homework', '20:15  read'],
};

export const KID_STARTERS = [
  "I've got football and homework. Which first?",
  "I'm too tired to read tonight.",
  'How do I get more points?',
  'Why do I always run out of evening?',
];

export const STARTER_QUESTIONS = [
  'Is he getting slower, or is something else going on?',
  'Why is bedtime sliding?',
  'Where is he on the days he gets home late?',
  'What did you notice this week?',
];
