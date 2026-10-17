// Bundled answers for when there is no API key, the call fails, or the venue
// wifi dies mid-demo. PRD §14: a clean honest demo beats a broken impressive one.
// These match the seeded problem in state.js (48 rolls, bags of 6, sells 7 bags).

export const FALLBACK_HINTS = [
  {
    hint: 'How many rolls go in ONE bag? Start there, not with the 48.',
    spoken: 'How many rolls go in one bag? Start there, not with the forty-eight.',
  },
  {
    hint: 'He sold 5 bags and then 2 more. How many bags did he sell altogether?',
    spoken: 'He sold five bags and then two more. How many bags is that altogether?',
  },
];

export const FALLBACK_CARD = {
  subject: 'Maths — multi-step word problem',
  concept:
    'It looks like division, but the real skill is holding three steps in order: make the bags, count what was sold, then see what is left.',
  answer: {
    value: '6 rolls',
    working: '48 ÷ 6 = 8 bags · 5 + 2 = 7 bags sold · 8 − 7 = 1 bag left · 1 × 6 = 6 rolls',
  },
  ladder: [
    {
      question: 'How many rolls go in one bag?',
      lookingFor: '"Six." If that comes easily, he has the entry point and just needs ordering.',
    },
    {
      question: 'So how many bags can he make from 48 rolls?',
      lookingFor: 'Eight. If he guesses, ask him to count up in sixes out loud.',
    },
    {
      question: 'He sold 5 bags, then 2 more. How many bags are still on the shelf?',
      lookingFor: 'One. Then he can find the rolls himself — do not say the last step.',
    },
  ],
  unlockLine:
    "Don't worry about the answer for a second. Just tell me what the question is actually asking us to find.",
  aiSkill: {
    name: 'Make the AI ask instead of answer',
    tryThis:
      '"Don\'t give me the answer. Ask me one question at a time until I work it out myself."',
  },
};

export const FALLBACK_PATTERNS = {
  finding:
    'Mert stays with a problem for about 12 minutes when it is geometry, but gives up on word problems after 4. This is not a focus problem — he cannot work out what the question is asking before the numbers distract him.',
  evidence: [
    'Word problems: gave up after 3m50s, 4m10s, 4m30s',
    'Geometry: stayed 11m and 13m without asking for help',
    'He used hint 1 and hint 2 on every word problem, and both hints were about re-reading the question',
  ],
  tonight:
    "Don't teach the maths tonight. Read one question together and ask him to underline the part that says what we're looking for. Ten minutes is enough.",
};

export const FALLBACK_QUEST = {
  title: 'Read the question twice before you touch the numbers',
  why: 'Mum noticed you solve fast, but sometimes you answer a different question.',
  points: 15,
};
