import Anthropic from '@anthropic-ai/sdk';
import { FALLBACK_HINTS, FALLBACK_CARD, FALLBACK_PATTERNS, FALLBACK_QUEST } from './fallback.js';

const MODEL = 'claude-opus-5-5';
const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;

const LANGUAGES = {
  en: 'English', de: 'German', tr: 'Turkish', ar: 'Arabic',
  uk: 'Ukrainian', ru: 'Russian', pl: 'Polish',
};

/** Claude is asked for JSON only. Tolerate a stray fence rather than crash on stage. */
function parseJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (fenced ? fenced[1] : text).trim();
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('no JSON object in response');
  return JSON.parse(raw.slice(start, end + 1));
}

async function ask({ system, user, image, effort = 'low', maxTokens = 2000 }) {
  const content = [];
  if (image) {
    content.push({
      type: 'image',
      source: { type: 'base64', media_type: image.mediaType, data: image.data },
    });
  }
  content.push({ type: 'text', text: user });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    output_config: { effort }, // 'low' keeps the watch feeling instant
    system,
    messages: [{ role: 'user', content }],
  });

  if (response.stop_reason === 'refusal') throw new Error('refused');
  const text = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');
  return parseJson(text);
}

// --- the guard that makes this a teaching tool and not a cheat button --------

/**
 * The whole product is "AI that refuses to answer". If a number from the
 * worked answer shows up in a hint, the hint is broken — we drop it.
 */
export function leaksAnswer(text, answerValue) {
  if (!text || !answerValue) return false;
  const haystack = text.toLowerCase();
  if (haystack.includes(String(answerValue).toLowerCase())) return true;
  const numbers = String(answerValue).match(/\d+/g) ?? [];
  return numbers.some((n) => new RegExp(`\\b${n}\\b`).test(haystack));
}

// --- JOB 1: THE BRAKE --------------------------------------------------------

const BRAKE_SYSTEM = `You are a hint-giver on a 10-year-old child's smartwatch.

You NEVER give the answer. Not a number, not a result, not "so it's 6". Ever.
You give ONE nudge that moves them one small step and hands the thinking back.

Rules:
- Point at something specific in THIS problem — its numbers, its objects, its words.
  A hint that would fit any problem is a failed hint.
- Level 1: the lightest possible nudge. Usable by a child who is completely stuck.
- Level 2: heavier. May go one step further, but still stops short of the answer.
- Under 90 characters. It is a watch.
- Warm, never disappointed, never "just think about it". No jargon, no praise inflation.
- Never mention being an AI, and never suggest looking it up.

Reply with JSON only:
{"hint": "<what appears on the watch>", "spoken": "<the same thing read aloud, numbers as words>"}`;

export async function brake({ problem, level, previousHints = [] }) {
  if (!client) return FALLBACK_HINTS[level - 1] ?? FALLBACK_HINTS[0];
  try {
    const out = await ask({
      system: BRAKE_SYSTEM,
      effort: 'low',
      maxTokens: 500,
      user: [
        `Problem (${problem.subject}): ${problem.text}`,
        previousHints.length
          ? `Hints already given: ${previousHints.map((h) => h.hint).join(' | ')}`
          : 'No hints given yet.',
        `Give hint level ${level}.`,
      ].join('\n\n'),
    });
    return { hint: String(out.hint), spoken: String(out.spoken ?? out.hint) };
  } catch (err) {
    console.error('[brake] falling back:', err.message);
    return FALLBACK_HINTS[level - 1] ?? FALLBACK_HINTS[0];
  }
}

// --- JOB 2: THE TRANSLATOR ---------------------------------------------------

const CARD_SYSTEM = `You turn a child's stuck moment into a Coaching Card for their parent.

The parent is not a teacher. They may not know this subject. They may not read the
language the homework is written in. They want to help without just saying the answer.

Produce exactly this JSON and nothing else:
{
  "subject": "<short label>",
  "concept": "<ONE sentence: what this problem is really testing. Not the topic — the skill.>",
  "answer": { "value": "<the answer>", "working": "<the steps, compact, for the parent only>" },
  "ladder": [
    { "question": "<what the parent says out loud>", "lookingFor": "<what a good answer from the child sounds like, and what to do if it doesn't come>" },
    { "question": "...", "lookingFor": "..." },
    { "question": "...", "lookingFor": "..." }
  ],
  "unlockLine": "<the exact sentence to say if the child is still stuck after question 2>",
  "aiSkill": { "name": "<the transferable technique, 3-6 words>", "tryThis": "<a prompt the parent can paste into any AI>" }
}

Hard rules:
- The answer appears ONLY in "answer". Never in a question, never in lookingFor, never in unlockLine.
- Exactly 3 questions, ordered: lightest nudge first, almost-there last.
- Every question must cite the actual numbers, words or objects in THIS problem.
- The unlock line is about understanding the question, not about the calculation.
- Write it the way a calm friend talks, not a textbook. Short sentences.`;

export async function translate({ problem, language = 'en', hintsAlreadyTried = [], persistSeconds = 0 }) {
  if (!client) return FALLBACK_CARD;
  try {
    const card = await ask({
      system: CARD_SYSTEM,
      effort: 'medium',
      maxTokens: 3000,
      image: problem.image,
      user: [
        `Problem (${problem.subject}): ${problem.text}`,
        `The child already tried these hints without getting there: ${
          hintsAlreadyTried.map((h) => h.hint).join(' | ') || 'none'
        }`,
        `They stayed with it for ${Math.round(persistSeconds / 60)} minutes before asking for you.`,
        `Write every parent-facing field in ${LANGUAGES[language] ?? 'English'}, whatever language the homework is in.`,
      ].join('\n\n'),
    });

    // The leak guard — a card that gives the game away is worse than no card.
    const value = card?.answer?.value;
    card.ladder = (card.ladder ?? []).map((step) =>
      leaksAnswer(step.question, value)
        ? { ...step, question: 'Read the question out loud to me — what is it asking us to find?' }
        : step,
    );
    if (leaksAnswer(card.unlockLine, value)) card.unlockLine = FALLBACK_CARD.unlockLine;
    return card;
  } catch (err) {
    console.error('[translate] falling back:', err.message);
    return FALLBACK_CARD;
  }
}

// --- JOB 2, the other direction: a parent's goal becomes something a child can hold

const QUEST_SYSTEM = `A parent has told you what they want for their child this week.
Turn it into ONE small task that fits on a smartwatch and that the child can finish today.

Rules:
- The task is a behaviour the child controls, never an outcome. "Read the question twice"
  works. "Get them right" does not.
- Title: under 60 characters, second person, no praise, no exclamation marks.
- "why": one short sentence in the parent's voice explaining where this came from, so it
  reads like their mum noticed something — not like an app issued an instruction.
- Points between 10 and 25, higher only if it genuinely costs the child more effort.

JSON only: {"title": "...", "why": "...", "points": 15}`;

export async function quest({ goal, child }) {
  if (!client || !goal) return FALLBACK_QUEST;
  try {
    const out = await ask({
      system: QUEST_SYSTEM,
      effort: 'low',
      maxTokens: 400,
      user: `Child: ${child.name}, age ${child.age}.\n\nWhat their parent said: "${goal}"`,
    });
    return {
      title: String(out.title),
      why: String(out.why),
      points: Math.min(25, Math.max(10, Number(out.points) || 15)),
    };
  } catch (err) {
    console.error('[quest] falling back:', err.message);
    return FALLBACK_QUEST;
  }
}

// --- JOB 3: THE OBSERVER -----------------------------------------------------

const OBSERVE_SYSTEM = `You read a week of a child's homework behaviour and tell their parent
what to do tonight.

You are looking at LEARNING BEHAVIOUR ONLY: which problems, how long they persisted,
which hints they used, when they asked for a person, and their own mood taps.
You have no access to anything else and you never speculate beyond this data.

Three rules:
- Find a PATTERN, not a score. Never rate, grade, diagnose or label the child.
- Separate the behaviour from the cause. "Gives up after 4 minutes" is the behaviour.
  "Can't parse what the question asks" is the hypothesis — say it as a hypothesis.
- End with ONE thing to do tonight that takes under 15 minutes and is not a lesson.

Never use: lazy, distracted, attention problem, behind, struggling, weak, disorder.

JSON only:
{"finding": "<2-3 sentences to the parent>", "evidence": ["<specific, from the data>", "..."], "tonight": "<one concrete thing, under 15 minutes>"}`;

export async function observe({ child, events }) {
  if (!client || !events?.length) return FALLBACK_PATTERNS;
  try {
    return await ask({
      system: OBSERVE_SYSTEM,
      effort: 'medium',
      maxTokens: 1500,
      user: `Child: ${child.name}, age ${child.age}.\n\nEvents:\n${JSON.stringify(events, null, 1)}`,
    });
  } catch (err) {
    console.error('[observe] falling back:', err.message);
    return FALLBACK_PATTERNS;
  }
}
