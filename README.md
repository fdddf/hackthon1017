# Tempo

> **It doesn't score your child. It tells you what to say tonight.**

A kid taps their way through the day on a **watch** — and asks it for help planning
their own evening. Their parent asks Claude about that week **in their own words**, sees
it as a chart and a map, and calls them.

Two people in one family, both learning to use AI.

Built in one day at [Claude Impact Lab Berlin](https://luma.com/claude-oofc), 17 Oct 2026.
Challenge: *AI education for everyone.* Audience: **parents** — and their children.

---

## Who it's for

Parents of children roughly 8–13, with a sharp edge for families in Berlin where the
parent works a late shift, reads German slowly, or simply isn't in the room at 17:00.

Most children that age here **have a kids' smartwatch and do not have a phone** — parents
chose that on purpose. The watch is the only device that is both on the child's wrist all
day and trusted by the parent. Nobody is building AI for it.

## The problem

- **What a parent sees:** homework starting at half nine, again. Bedtime creeping. A kid
  who seems slower than last year.
- **What they conclude:** he's getting lazy. It's the only explanation visible from the
  kitchen at 21:40.
- **What's actually happening:** two days a week he gets home ninety minutes later,
  because training moved across town. **Nobody ever put those two columns side by side —
  including the parent, who has all the information and none of the pattern.**

## Why this is a "use AI" project, not an app with AI in it

An app that quietly runs analysis in the background is not a person using AI. So:

- **The parent types the question herself**, the way she'd say it to a friend. What makes
  it work isn't the interface — it's that for the first time she has something worth
  asking about: her own child's real data, and her own worry. Most parents have never had
  a reason to open an AI. This is one.
- **The child asks his own AI** on the wrist — "I've got football and homework, which
  first?" — and it helps him *order his own evening* instead of doing anything for him.
  A ten-year-old learning that an AI is a thinking tool rather than an answer machine is
  the most durable thing we could teach in a day.
- **Every answer to the parent ends with what made that question answerable** — "you gave
  me five days of times instead of saying he's lazy." She takes that to any AI, anywhere.
  That's the *learn* half of the brief, and it costs one field in the response.
- **Starter questions are the on-ramp.** Someone who has never used AI doesn't know what
  to type. Blank-page paralysis is the real barrier, not scepticism.

## What's in it

### The watch (the child's)

- **Eight check-ins a day** — woke, left, got home, moved, homework, read, screens off,
  in bed. Each tap is a timestamp, a place and some points.
- **A day ring** that fills as the day takes shape. It shows the shape; it doesn't grade it.
- **His own AI** — short, watch-sized answers that help him decide, never do it for him.
  Skipping a thing is allowed; the prompt says so.
- **Points that buy time with a parent, not toys** — "20 minutes of football with Dad."
- **A one-tap mood**, and a streak he cares about more than we expected.
- **"What Mum can see"** — a complete list of what's shared, in words a ten-year-old reads.

### The phone (the parent's)

- **Ask** — any question, in her own words. Claude answers from the real times, quotes
  them, separates behaviour from cause, and says "I can't see that from this" when it can't.
  Then one thing to do tonight, and the AI skill she just used.
- **Week** — five evenings drawn, one line each, from getting home to getting into bed.
- **Map** — pins where a check-in happened. The Tuesday mystery, made visible.
- **History** — earlier conversations, re-askable with a tap.
- **Send to his watch** — the advice, rewritten by Claude in her own voice. Never a
  reminder, never a telling-off.
- **Video or audio call** — video at home, audio on the tram. The week stays on screen
  while they talk.
- The answer renders in Türkçe, العربية, Українська, Deutsch or English.

## Where we draw the privacy line

We are building behaviour tracking for children, and there is a map in it. So:

| We collect | We never collect |
|---|---|
| The times he tapped, which ones he skipped, **the place attached to a tap he made**, the face he picked, points and streak | Continuous location. Any location he didn't attach himself. Audio. Camera. Messages. Screen time. Contacts. Anything outside a check-in. |

1. **He taps it, or it doesn't exist.** Every point in the system was put there by the
   child on purpose, the places included. Nothing is sensed or inferred in the background.
2. **He can see the deal.** The "What Mum can see" screen on his own watch is complete.
3. **Guidance, never judgement.** The prompts forbid *lazy, distracted, behind, struggling,
   weak* and every clinical label. Output is "do this tonight", never "your child has a problem."
4. **No live location, ever.** There is deliberately no "where is he now". That is the
   product a dozen companies already sell, and it's the one that makes a child feel followed.

---

## Run it

Needs Node 20+.

```bash
npm install
cp .env.example .env     # paste your Anthropic API key into .env
npm run dev
```

Open **http://localhost:5173** — both devices side by side. That's the demo view.

| URL | What |
|---|---|
| `/` | The stage: watch and phone together |
| `/watch` | The child's watch alone (open on a phone to hold a real device) |
| `/parent` | The parent's phone alone |

**It runs without an API key.** Every Claude call falls back to bundled content, so the
whole flow demos on a dead network. The server log says `⚠ No ANTHROPIC_API_KEY`.

To put it on a real phone in the room: `npm run tunnel` (needs `cloudflared`).

### Walk the demo

1. Watch → tap **Got home**, then a few more check-ins
2. Watch → **Ask** → "I've got football and homework. Which first?"
3. Phone → type or tap **"Is he getting slower, or is something else going on?"**
4. Phone → **Week**, then **Map** — the same fact, drawn two ways
5. Phone → **Send tonight's suggestion to his watch** → it arrives in her voice
6. Phone → **Video call** or **Audio call** → the watch rings → answer
7. Watch → **Me** → what Mum can see

---

## How it's built

```
src/watch/     the round face          src/parent/   the four-tab phone app
src/lib/       ws client, WebRTC, shared chart + map, types
server/        express + ws hub, four Claude jobs, bundled fallbacks
```

Everything is TypeScript. One `npm run dev` starts both halves.

**The server is authoritative.** Both clients render from one state object pushed over a
WebSocket, so the watch and the phone can never disagree in front of a judge. WebRTC
carries audio and video only; signalling rides the same socket. Same-host P2P, STUN only.

**Four Claude calls**, all `claude-opus-5-5`:

| Call | Job | Effort |
|---|---|---|
| `askAboutChild()` | the parent's question, grounded in five real days | `medium` |
| `kidAsk()` | the child's own AI, on the wrist | `low` — a watch must feel instant |
| `noticed()` | the unprompted read, for a parent who doesn't know what to ask | `medium` |
| `nudge()` | tonight's advice, rewritten in the parent's own voice | `low` |

**The prompts are the product.** They require every claim to quote the times it came
from, forbid the answer implying any knowledge of where the child is *now*, cap watch text
at 220 characters, ban diagnostic language, and tell the child's AI in as many words that
it does not enforce anything and is not his parent.

**The chart is deliberately one colour.** A chart that scored his week in traffic lights
would contradict the product's own claim in the first second a judge looked at it.
Position carries the message; colour stays out of it. The series colour was validated
against both the light and dark chart surfaces.

**It degrades at every layer.** No API key, a failed call, a refusal, malformed JSON, a
dropped socket, no camera or microphone — each has a fallback, and the demo survives all
of them. The venue wifi was never going to be our single point of failure.

---

## What's real and what isn't

Judges asked for honesty, so:

- **Verified working:** both clients and the live state sync; all eight check-ins with
  their places; the watch's own AI; the parent's free-text and starter questions; the week
  chart and its table; the map; history; sending a nudge to the watch; the call state
  machine end to end (parent rings → watch rings → child answers → both show connected →
  either can hang up); the Cloudflare tunnel.
- **The call's media path is not verified.** Signalling and the state machine are. The
  audio/video peer connection needs a machine with camera and microphone permission;
  where it's denied, the call degrades on its own to a UI-only path and says so on screen.
  **Test it on the demo machine before recording.**
- **All four Claude calls have been run live and tuned.** Latency on the seeded week:
  the parent's question 8–10s (13s in Turkish), the child's watch 3–6s, the weekly read
  7s, the nudge 3s. The bundled fallbacks are frozen copies of real answers, so the
  offline path looks identical to the live one on stage.
- **Asked where the child is, it refuses.** "I can't see where he is. There's no tracking,
  only what he taps." That is the prompt working, and it is the strongest thirty seconds
  of the demo.
- **Seeded:** the five-day week the answers are built on, and the fourteen weeks of
  history. We built this in an afternoon; we could not generate a real term.
- **Schematic:** the map is a drawn neighbourhood, not map tiles. The real product would
  use a real map; the pin rule — only places attached to a tap — is the part that matters.
- **One family, in memory:** no database, no accounts. Restarting the server resets it.
- **Not built:** real watch hardware. The watch is a faithful 300px round face in the
  browser, sized and constrained like the real thing.

## Credits

Built with [Claude Code](https://claude.com/claude-code). React, Vite, Express, `ws`,
`@anthropic-ai/sdk`. No other dependencies.

Team brief (playable): [`docs/relay-brief.html`](docs/relay-brief.html) ·
Product brief: [`docs/wyl_prd_relay.md`](docs/wyl_prd_relay.md)
