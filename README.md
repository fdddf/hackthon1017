# Relay

> **AI doesn't answer. It passes the ball.**

A kid's **watch** and a parent's **phone**, with Claude between them — not doing the
homework, not policing the child, but making sure the two humans connect at the moment
it matters.

Built in one day at [Claude Impact Lab Berlin](https://luma.com/claude-oofc), 17 Oct 2026.
Challenge: *AI education for everyone.* Audience: **parents** — and their children.

---

## Who it's for

Parents of children roughly 8–13, with a sharp edge for immigrant families in Berlin.

Most children that age here **have a kids' smartwatch and do not have a phone** — parents
chose that on purpose. The watch is the only device that is both on the child's wrist all
day and trusted by the parent. Nobody is building AI for it.

## The problem

Three things go wrong in the same ten minutes of an evening:

1. **The kid gets stuck**, and the fastest escape is a chatbot that hands over a finished
   answer. They stop being stuck, and they stop learning.
2. **The kid doesn't ask for help**, because asking feels like admitting you're bad at it.
   So they stall, guess, or quit, and nobody finds out until the test.
3. **The parent isn't there** — other room, other shift, other country — or is there but
   doesn't know *how* to help, so they say the answer, or they say "concentrate."

AI made this worse, not better. Nothing makes the **slow** path — the one where the kid
actually learns — easy enough to choose at 9pm.

And for a parent whose German isn't fluent, a German worksheet is simply out of reach.
Their child does homework alone, in a language the household doesn't share.

## What Relay does

```
  CHILD (watch)                CLAUDE                    PARENT (phone)
  ─────────────                ──────                    ──────────────
  "I'm stuck"      ──────▶  1. THE BRAKE
                            one hint, never the answer
                   ◀──────  hint 1 → hint 2
                                 │  still stuck
                                 ▼
                            2. THE TRANSLATOR
                            turns the stuck moment    ──────▶  Coaching Card
                            into something a parent            + the watch rings
                            can act on
                                 │
  check-ins, mood,  ──────▶  3. THE OBSERVER          ──────▶  This week's pattern
  persistence time             patterns in *learning*          + what to do tonight
                               behaviour, never a score
```

### On the child's watch

- **The Persistence Ring** fills while they stay with a problem. **It rewards time spent,
  not correctness.** Every other system in a child's life rewards the right answer.
- **The Help Ladder** — three dots, always visible. Two are AI hints. **The third is their
  parent's face.** The child can see, before they ask, that help exists, that it's finite,
  and that the last rung is a person. Help shame is the real reason kids don't ask, and
  three dots on a wrist fix more of it than any amount of encouragement.
- **I'm stuck** — one button. The hint comes back as text *and* spoken aloud.
- **Quests and points** — one task at a time, and **points buy time with a parent, not
  toys**: "20 minutes of football with Dad."
- **What Mum can see** — a screen on the *child's* watch listing exactly what is shared,
  in words a ten-year-old reads. No hidden collection, ever.

### On the parent's phone

- **Tonight** — what they're stuck on, how long they held on, which hints they used.
- **The Coaching Card**, which appears by itself when the ladder reaches the third dot:
  what this is really testing · **the answer, collapsed behind two clicks and a "Sure?
  Try the questions first"** · three questions to ask in order · the exact sentence to say
  if they're still stuck · and **the AI skill you just used**, so the parent takes the
  technique to any AI, anywhere.
- **Read this card in** Türkçe, العربية, Українська, Deutsch or English — *even when the
  homework is in another language.*
- **Call** — one tap to the watch, **with the card still on screen**, so the parent reads
  question one while they talk.
- **Patterns** — the week's read: where they quit, where they persist, one thing to do
  tonight. Guidance, never a grade.

## Why the call is in here

A video call is the kind of thing a hackathon team bolts on to look impressive. Ours is
**the last rung of the ladder.** The whole argument is that AI should know when to stop
and get a human — so it ends at a parent's face, and the parent arrives already briefed.

Every other tool tries to replace a person. This one is engineered to summon one, and to
make them better when they arrive.

## Where we draw the privacy line

| We collect | We never collect |
|---|---|
| Which problem, how long they stayed, hints used, mood taps | Location. Audio. Camera. Messages. Screen time. Anything outside a homework session. |

1. **Learning behaviour only** — the tool points at a worksheet, never at a child.
2. **The child can see the deal** — the "What Mum can see" screen is complete.
3. **Output is guidance, never judgement** — "do this tonight," never "your child has an
   attention problem." The Observer prompt forbids the words *lazy, distracted, behind,
   struggling, weak*.

We do not read children's AI chats. We do not track them.

---

## Run it

Needs Node 20+.

```bash
npm install
cp .env.example .env     # paste your Anthropic API key into .env
npm run dev
```

Then open **http://localhost:5173** — both devices, side by side. That's the demo view.

| URL | What |
|---|---|
| `/` | The stage: watch and phone together |
| `/watch` | The child's watch alone (open on a phone to hold a real device) |
| `/parent` | The parent's phone alone |

**It runs without an API key.** Every Claude call falls back to bundled content, so the
whole flow demos on a dead network. You'll see `⚠ No ANTHROPIC_API_KEY` in the server log.

To put it on a real phone in the room:

```bash
npm run tunnel
```

### Walk the demo

1. Watch → **Start**
2. Watch → **I'm stuck** → hint 1, spoken. One dot goes out. *No answer on screen.*
3. Watch → **I'm stuck** → hint 2. Second dot out.
4. Watch → **Still stuck — ask Mum** → the phone lights up with the Coaching Card
5. Phone → reach for the answer. It's collapsed. Click twice.
6. Phone → **Call** → the watch rings → **answer** → the card stays up during the call
7. Phone → **Patterns**, and the **Read this card in** language switch
8. Watch → **Me** → what Mum can see

---

## How it's built

```
src/watch/     the round face           src/parent/   the phone
src/lib/       ws client, WebRTC, types
server/        express + ws hub, the three Claude jobs, bundled fallbacks
```

Everything is TypeScript. One `npm run dev` starts both halves.

**The server is authoritative.** Both clients render from one state object pushed over a
WebSocket, so the watch and the phone can never disagree in front of a judge. WebRTC
carries audio and video only; signalling rides the same socket. Same-host P2P, STUN only,
no TURN.

**Four Claude calls**, all `claude-opus-5-5`:

| Endpoint | Job | Effort |
|---|---|---|
| `brake()` | one hint, never the answer | `low` — the watch must feel instant |
| `translate()` | stuck moment → Coaching Card, in the parent's language | `medium` |
| `observe()` | a week of behaviour → one pattern and one action | `medium` |
| `quest()` | a parent's goal → a task a child can hold | `low` |

**The prompt is the product.** The system prompts forbid the answer appearing in any hint,
require every hint to cite the specific numbers and objects in *this* problem, cap watch
text at 90 characters, and ban diagnostic language in the Observer.

**And we check.** `leaksAnswer()` in `server/claude.js` scans every hint and every ladder
question for the answer's value and digits, and replaces any that leak. A coaching tool
that gives the game away is worse than no coaching tool.

**It degrades at every layer.** No API key, a failed call, a refusal, malformed JSON, a
dropped socket, no camera, no speech synthesis — each has a fallback, and the demo
survives all of them. The venue wifi was never going to be our single point of failure.

---

## What's real and what isn't

Judges asked for honesty, so:

- **Real:** both clients, the live state sync, the help ladder, the leak guard, all four
  Claude calls, the language switch, the collapsed answer, WebRTC signalling and the peer
  connection.
- **Seeded:** the week of behaviour the Observer reads. We built this in an afternoon; we
  could not generate a real week. The analysis over it is a real Claude call.
- **One family, in memory:** no database, no accounts. Restarting the server resets it.
- **Not built:** real watch hardware. The watch is a faithful 300px round face in the
  browser, sized and constrained like the real thing.

## Credits

Built with [Claude Code](https://claude.com/claude-code). React, Vite, Express, `ws`,
`@anthropic-ai/sdk`. No other dependencies.

Product brief: [`docs/wyl_prd_relay.md`](docs/wyl_prd_relay.md)
