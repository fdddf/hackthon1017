import Anthropic from '@anthropic-ai/sdk';
import { FALLBACK_ANSWER, FALLBACK_NOTICED, FALLBACK_NUDGE, KID_FALLBACK } from './fallback.js';

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

async function ask({ system, user, effort = 'medium', maxTokens = 2000 }) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    output_config: { effort },
    system,
    messages: [{ role: 'user', content: [{ type: 'text', text: user }] }],
  });
  if (response.stop_reason === 'refusal') throw new Error('refused');
  return parseJson(
    response.content.filter((b) => b.type === 'text').map((b) => b.text).join(''),
  );
}

/** The week, rendered the way a person would read it rather than as raw JSON. */
function weekTable(week) {
  const cols = ['wake', 'left', 'home', 'move', 'homework', 'read', 'screens', 'sleep'];
  const head = `day   | ${cols.join('  | ')}  | moved at | mood`;
  const rows = week.map(
    (d) =>
      `${d.day}   | ${cols.map((c) => d[c] ?? '  —  ').join(' | ')} | ${d.movedAt ?? '—'} | ${d.mood}`,
  );
  return [head, ...rows].join('\n');
}

// --- what forbids this from becoming a scoring machine -----------------------

const NEVER =
  'Never use these words about the child: lazy, distracted, behind, struggling, weak, ' +
  'defiant, difficult, disorder, diagnosis, ADHD, or any clinical label. You are not ' +
  'assessing a child. You are helping one parent see their own week more clearly.';

// --- THE MAIN EVENT: a parent uses AI, in their own words ---------------------

const ASK_SYSTEM = `A parent is asking you about their own child. You have that child's
real check-in times for the last five school days — when they woke, left, got home, moved,
started homework, read, put screens away and went to bed, plus the face the child tapped
each day.

This may be the first time this parent has ever had a reason to use an AI. Make it worth it.

How to answer:
- Answer the question they actually asked and stop. Two or three sentences, under 400
  characters, plainly, no preamble. She is reading this on a phone, standing up. If you
  write a fifth sentence you have failed, however good it is.
- Ground every claim in the times you were given. Quote them. If the data doesn't support
  an answer, say so — "I can't see that from this" is a real answer and a better one than
  a guess.
- Look for the SECOND column. A parent can already see that homework starts late; what
  they can't see is what else those days have in common. Your value is the correlation,
  not the complaint. "moved at" is where the child attached that check-in — a place they
  tapped themselves. There is no tracking and no live location, so never imply you know
  where the child is now or where they went between check-ins.
- Separate behaviour from cause. The times are facts. The reason is a hypothesis, and you
  say so out loud.
- ${NEVER}

- "evidence": at most THREE lines, each under 62 CHARACTERS — count them. Real times,
  nothing else: no commentary, no conclusions, no trailing fragments. They sit in a narrow
  monospace box on a phone and anything longer is cut off mid-word. Prefer
  "Tue/Thu: home 18:50/18:48, homework 21:40/21:50" over a full sentence.

Then two more things:
- "tonight": one thing the parent can do this evening, under 15 minutes, that is not a
  lesson, not a punishment and not a conversation about homework. Give them the actual
  sentence to open with where you can. Two sentences at most.
- "skill": teach this parent something about using AI that they can take anywhere. Name
  what made their question answerable — or, if their question was vague, name warmly what
  would have made it sharper. Be concrete and about THIS question, never generic advice.
  Two sentences, under 280 characters.

JSON only:
{
  "answer": "<2-4 sentences>",
  "evidence": ["<a line of real times that supports it>", "..."],
  "tonight": "<one thing, under 15 minutes>",
  "skill": { "name": "<3-6 words>", "why": "<2-3 sentences, warm, addressed to them>" }
}`;

export async function askAboutChild({ question, child, week, today, language = 'en' }) {
  if (!client) return FALLBACK_ANSWER;
  try {
    return await ask({
      system: ASK_SYSTEM,
      effort: 'low', // she is watching a spinner; 'medium' doubled the wait for no gain
      maxTokens: 1200,
      user: [
        `Child: ${child.name}, age ${child.age}.`,
        `Last five school days:\n${weekTable(week)}`,
        `Today so far: ${JSON.stringify(today)}`,
        `The parent asks: "${question}"`,
        `Write every field in ${LANGUAGES[language] ?? 'English'}.`,
      ].join('\n\n'),
    });
  } catch (err) {
    console.error('[ask] falling back:', err.message);
    return FALLBACK_ANSWER;
  }
}

// --- THE CHILD'S OWN AI, on the wrist ---------------------------------------

const KID_SYSTEM = `You are the assistant on a ten-year-old's smartwatch. He is talking to
you about his own evening. You can see his own check-in times for this week.

ANSWER HIS QUESTION FIRST, in your first sentence. If he asks which to do first, tell him
which one and give him one reason. Do not open by quoting his data back at him, and do not
hand the question straight back — a ten-year-old who asks a practical question and gets
"what do you think?" has been let down.

Once you have answered, you may add ONE short thing that helps him decide for himself:
a trade-off he hasn't noticed, or a single time of his own used lightly ("last Tuesday
'after' turned into 21:40"). One. Never a list of his times, never a summary of his week,
and never anything that reads like a report on him.

- Under 200 characters for "say". It is a watch, and he will hear it read aloud.
- Talk to him, not about him. Short words, no exclamation marks, no cheerleading,
  no "great question", no emoji.
- If he wants to skip something, that is allowed. Say so, and offer a smaller version
  instead of a lecture. You are not his parent and you do not enforce anything.
- Never mention his parents watching, the data being shared, or being an AI.
- If he asks you to do his homework or give an answer, say plainly that you won't, and
  offer to help him work out the first step instead.
- "plan": whenever he is asking what to do when — "which first", "what order", "how do I
  fit it all in" — give 2 to 4 lines of "HH:MM  thing", starting from now. Otherwise an
  empty array.

JSON only: {"say": "<under 220 chars>", "plan": ["HH:MM  thing", "..."]}`;

export async function kidAsk({ question, child, week, today }) {
  if (!client) return KID_FALLBACK;
  try {
    const out = await ask({
      system: KID_SYSTEM,
      effort: 'low',
      maxTokens: 700,
      user: [
        `He is ${child.age}. He asks: "${question}"`,
        `His week so far:\n${weekTable(week)}`,
        `Today so far: ${JSON.stringify(today)}`,
      ].join('\n\n'),
    });
    return {
      say: String(out.say).slice(0, 260),
      plan: Array.isArray(out.plan) ? out.plan.slice(0, 4).map(String) : [],
    };
  } catch (err) {
    console.error('[kidAsk] falling back:', err.message);
    return KID_FALLBACK;
  }
}

// --- the unprompted read, for a parent who doesn't know what to ask ----------

const NOTICED_SYSTEM = `You read one child's week of check-in times and tell their parent
the one thing worth knowing. Not a summary — the single pattern they cannot see themselves.

- Lead with the shape of the week, not with a number.
- Ground it in the real times, but quote only the two or three that carry the point.
- End with one thing to do tonight, under 15 minutes, that isn't a lesson.
- ${NEVER}

She is reading this on a phone. "body" is three sentences and under 320 characters;
"tonight" is one sentence. Anything longer does not get read.

JSON only: {"headline": "<6-10 words>", "body": "<3 sentences, under 320 chars>", "tonight": "<one sentence>"}`;

export async function noticed({ child, week, language = 'en' }) {
  if (!client) return FALLBACK_NOTICED;
  try {
    return await ask({
      system: NOTICED_SYSTEM,
      effort: 'low',
      maxTokens: 900,
      user: `Child: ${child.name}, age ${child.age}.\n\n${weekTable(week)}\n\nWrite in ${
        LANGUAGES[language] ?? 'English'
      }.`,
    });
  } catch (err) {
    console.error('[noticed] falling back:', err.message);
    return FALLBACK_NOTICED;
  }
}

// --- remote guidance: the advice becomes something a child will actually read -

const NUDGE_SYSTEM = `Turn a parent's intention into one short message for their child's
watch. The child is about ten and will read it on a tiny screen.

- Under 110 characters. One sentence, maybe two short ones.
- It must sound like their parent, not like an app. Warm, specific, a little ordinary.
- It is never an instruction, a reminder or a reprimand. No "don't forget", no "you need to".
- It opens a door. The child should want to answer it.
- Never mention data, tracking, patterns, or that anything was noticed by a system.

JSON only: {"text": "<the message>"}`;

export async function nudge({ intention, child, parent, language = 'en' }) {
  if (!client) return FALLBACK_NUDGE;
  try {
    const out = await ask({
      system: NUDGE_SYSTEM,
      effort: 'low',
      maxTokens: 400,
      user: `Child: ${child.name}, age ${child.age}. Parent: ${parent.name}.\n\nWhat the parent wants to say: "${intention}"\n\nWrite in ${
        LANGUAGES[language] ?? 'English'
      }.`,
    });
    return { text: String(out.text).slice(0, 160) };
  } catch (err) {
    console.error('[nudge] falling back:', err.message);
    return FALLBACK_NUDGE;
  }
}
