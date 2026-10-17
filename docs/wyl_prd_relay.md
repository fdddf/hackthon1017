# Relay

> **AI doesn't answer. It passes the ball.**

A kid's **watch** and a parent's **phone**, with Claude sitting between them — not doing the homework, not policing the child, but making sure the two humans actually connect at the moment it matters.

**Audience:** parents of children roughly 8–13, and those children. Sharp edge for immigrant families in Berlin.
**Event:** Claude Impact Lab Berlin, 17 Oct 2026 · Build 11:00–14:45 · Record 14:45 · Deadline 16:00.

---

## 1. Why a watch

This is the decision the whole product hangs on, so it goes first.

Most 8–13 year olds in this city **have a kids' smartwatch and do not have a phone**. Parents chose that on purpose: they want to reach the child without handing them an internet portal. That makes the watch the only device that is simultaneously **on the child's wrist all day** and **trusted by the parent**.

It is also the right *shape* for this product. A watch can only show one thing at a time, can't be scrolled, and can't hold a chatbot. Those constraints are usually treated as limitations. For us they are the thesis:

> The problem isn't that kids get too little from AI. It's that they get too much, too fast, too finished.
> A screen that can only give you **one hint** is a feature.

Nobody else in this room is building for a watch. We should say that out loud.

---

## 2. The problem, restated

Three failures happen in the same ten minutes of an evening:

1. **The kid gets stuck** and the fastest escape is a chatbot that hands over a finished answer. They stop being stuck, and they stop learning.
2. **The kid doesn't ask for help** — asking feels like admitting you're bad at it. So they stall, guess, or quit, and nobody finds out until the test.
3. **The parent isn't there** — different room, different shift, different country — or is there but doesn't know *how* to help, so they say the answer, or they say "concentrate."

And the layer on top: **parents have no idea what's actually going on.** Not "is my kid on their phone" — that's surveillance, and it's the wrong question. The right question is: *where does my kid give up, and why?* No tool answers that today.

---

## 3. The system

Three actors. Claude is the one in the middle, and it has exactly three jobs.

```
  CHILD (watch)                 CLAUDE                  PARENT (phone)
  ─────────────                 ──────                  ──────────────
  "I'm stuck"      ──────▶  1. BRAKE
                            one hint, not the answer
                   ◀──────  hint 1 → hint 2
                                 │
                                 │ still stuck
                                 ▼
                            2. TRANSLATOR
                            turns the stuck moment     ──────▶  Coaching Card
                            into something the                  + the watch rings
                            parent can act on
                                 │
  check-ins, mood,  ──────▶  3. OBSERVER             ──────▶  Weekly pattern
  how long they                finds patterns in               + what to do tonight
  persisted                    *learning behaviour*
```

### Job 1 — The Brake
The child presses **I'm stuck**. Claude does *not* answer. It gives **one** hint, sized to this exact problem. Still stuck → a second, heavier hint. Still stuck → it hands over to a human. The answer is never on the watch. Ever.

### Job 2 — The Translator
Two directions:
- **Kid → parent:** the stuck moment becomes a **Coaching Card** on the parent's phone — what this is really testing, three questions to ask in order, the unlock line, and the answer *collapsed behind two clicks*.
- **Parent → kid:** a parent goal ("he needs to read the question before calculating") becomes a small, concrete quest the watch can show.

### Job 3 — The Observer
From check-ins, hints used, and persistence time, Claude finds **patterns, not scores**:

> *"Over five days he gives up on word problems after about 4 minutes, but stays with geometry for 12. It isn't focus. He can't parse what the question is asking."*
> **Tonight:** don't teach the maths. Read one question together and have him underline what it's actually asking for.

---

## 4. The child's watch

One screen at a time. No feed, no scroll, no chat. Everything below is round-face sized.

**① The Persistence Ring**
A ring that fills while the child stays on a problem. **It rewards time spent, not correctness.** This is the single most important design decision on the watch: every other system in a child's life rewards the right answer. We reward not quitting. Claude can see this ring; so can the parent.

**② The Help Ladder — three dots**
Always visible: `● ● ●`. Dot one and two are AI hints. **Dot three is their parent's face.** Using a dot puts it out.

Why this matters more than it looks: the child can *see*, before they ask, that help exists and that it's finite and that the last rung is a person. It makes asking feel like using a tool you were given, not like confessing. **Help shame is the actual reason kids don't ask, and three dots on a wrist fixes more of it than any amount of encouragement.**

**③ I'm stuck**
One big button. Or say it — the watch listens. The hint comes back as short text *and* spoken aloud, because a child reading a hint and a child hearing a hint are not the same child.

**④ Quests & points**
Claude turns the parent's goal into one small task. Only ever one on screen. Done → tap → points.
**Points buy time with the parent, not toys.** "20 minutes of football with Dad." "You pick the Saturday film." This is deliberate: we refuse to teach a child that effort converts into stuff.

**⑤ Mood ring**
Three faces, one tap, a few times a day. One second. It's the honest input to the Observer, and because it's one tap it doesn't feel like being studied.

**⑥ What my parent can see**
A screen on the *child's* watch showing exactly what gets shared. Plain words, child-readable. No hidden collection — ever. The child can see the deal.

---

## 5. The parent's phone

**① Tonight** — the one screen that matters. What they got stuck on, how long they held on, which hints they used, whether they asked for you.

**② The Coaching Card** — appears by itself the moment the ladder reaches the third dot.
1. What this is really testing — one line
2. **The answer — collapsed.** Two clicks and friction copy: *"Sure? Try the questions first."* We make it hard for the parent to cheat.
3. Three questions, in order, lightest nudge first, each citing the actual numbers in *this* problem
4. If they're still stuck after Q2 — the exact sentence to say
5. **The AI skill you just used** — the transferable technique, so the parent takes it to any AI, anywhere

Rendered in the parent's language even when the homework is in German. Turkish, Arabic, Ukrainian, Russian, Polish, English, German.

**③ Call** — one tap, straight to the watch. **The Coaching Card stays on screen during the call.** The parent reads question one off their phone while talking to their kid. This is the shot we build the whole demo around.

**④ Patterns** — the Observer's weekly read: where they quit, where they persist, what to do about it tonight. Guidance, never a grade.

---

## 6. Why the call has to be in here

A video call is the kind of thing a hackathon team bolts on to look impressive. Ours isn't bolted on — **it's the last rung of the ladder.**

The entire product argument is *AI should know when to stop and get a human*. If the ladder ended at hint two, we'd be another chatbot with a smaller screen. It ends at a parent's face, and the parent arrives **already briefed** — card in hand, three questions ready, answer hidden.

That's the thing to say in Q&A: **every other tool here is trying to replace a person. Ours is engineered to summon one — and to make them better when they arrive.**

---

## 7. Where we draw the privacy line

Written down because European judges will ask, and because it's right.

| We collect | We never collect |
|---|---|
| Which problem, how long they stayed, hints used, mood taps | Location. Audio. Camera. Messages. Screen time. Anything they do outside a homework session. |

Three rules, no exceptions:
1. **Learning behaviour only** — the tool points at a worksheet, never at a child.
2. **The child can see the deal** — screen ⑥ exists, and it's complete.
3. **Output is guidance, never judgement** — "do this tonight," never "your child has an attention problem."

Say rule 2 in the pitch. Nobody else will have it.

---

## 8. Architecture

Everything is TypeScript. One repo, one `npm run dev`.

```
apps/web        Vite + React + TS   /watch  → child, round-face shell
                                    /parent → phone frame
server/         Node + Express + ws  /api/*  Claude calls (key stays server-side)
                                             WebSocket: presence, events, WebRTC signalling
```

**Why WebSocket and not WebRTC data channels for state:** state sync must never fail on stage. A local `ws` hub is 20 lines and cannot surprise us. WebRTC carries audio/video only.

**Four Claude calls:**

| Endpoint | Job | Returns |
|---|---|---|
| `POST /api/hint` | The Brake — level 1 or 2 | `{ hint, spoken, revealsAnswer: false }` |
| `POST /api/card` | The Translator — kid → parent | `CoachingCard` |
| `POST /api/quest` | The Translator — parent → kid | `{ title, why, points }` |
| `POST /api/patterns` | The Observer, over a week of events | `{ finding, evidence[], tonight }` |

```ts
type CoachingCard = {
  subject: string;
  concept: string;                                   // block 1
  answer: { value: string; working: string };        // block 2, collapsed
  ladder: { question: string; lookingFor: string }[];// block 3, exactly 3
  unlockLine: string;                                // block 4
  aiSkill: { name: string; tryThis: string };        // block 5
};
```

**The prompt is the product.** Hard rules in the system prompt:
- The answer appears only in `answer`. Never in a hint, never in `ladder`, never in `unlockLine`. Server-side check rejects a response where it leaks.
- Every hint and question must cite **the specific numbers, words or objects in this problem**. A hint that would work for any problem is a failed hint.
- Hint 1 must be usable by a child who is genuinely stuck. Hint 2 may be one step from the answer. Neither crosses it.
- Watch text: **under 90 characters**, spoken-aloud friendly, no jargon, warm, never disappointed.
- All parent-facing text in the parent's chosen language, whatever language the homework is in.

**WebRTC:** both clients on one machine, our `ws` as signalling, STUN only — same-host P2P needs no TURN.
**Cloudflare Tunnel:** `cloudflared tunnel --url http://localhost:5173` so a real phone in the room opens the parent app by QR. Big demo win, and a dependency on venue wifi — so it is **never** the only path (see §10).

---

## 9. Build order — five stages, each demo-able alone

It is 12:00. We stop at 14:45. Every stage ends with something we could record if the clock ran out.

| Stage | Window | Ships | If the clock ran out here, the demo is |
|---|---|---|---|
| **S1** | 12:00–12:40 | Two UI shells + `ws` hub. Kid taps *I'm stuck* → parent's phone lights up. | "Two devices, one family, instantly connected." Thin, but real. |
| **S2** | 12:40–13:20 | `/api/hint` + `/api/card`. The full ladder: hint → hint → card on the parent's phone. | **The actual product.** This alone is a strong submission. |
| **S3** | 13:20–13:50 | Persistence ring, quests, points, mood, `/api/patterns` over seeded week data. | Product + insight. Now it's a system. |
| **S4** | 13:50–14:30 | WebRTC call, card pinned during the call. Tunnel + QR if the network behaves. | The money shot. |
| **S5** | 14:30–14:45 | Offline fallback cards, README, freeze. **No new code after 14:45.** | — |

**Cut order when we're behind — decide fast, don't debate:**
Cloudflare Tunnel → `/api/patterns` (ship a pre-generated finding) → quests/points → WebRTC → mood.
**Never cut:** the help ladder, the collapsed answer, the two-device moment.

**Hard rule:** if WebRTC isn't connecting by **14:30**, we stop. The call becomes UI-only — parent taps, watch rings, "connected" — and we say in the README that audio is scripted. A clean honest demo beats a broken impressive one, and judges have seen a hundred failed live calls.

---

## 10. The demo video — shot by shot (2:00)

Record at **14:45**. Two browser windows side by side: round watch face left, phone frame right. One real worksheet on a real table.

| Time | Shot |
|---|---|
| 0:00–0:15 | A parent on our team, no slides: *"My son has a watch, not a phone. When he's stuck on homework in the other room, I find out three weeks later, from his teacher."* |
| 0:15–0:30 | Watch: a maths problem. The **persistence ring** fills. Three dots glow. Say: *"We reward him for not quitting, not for being right."* |
| 0:30–0:45 | He taps **I'm stuck**. Hint one, spoken aloud. **No answer.** One dot goes out. |
| 0:45–1:00 | Hint two. Second dot out. *"Still nothing on screen that he could copy."* |
| 1:00–1:20 | Third dot — **his mum's face.** Her phone lights up with the Coaching Card. She reaches for the answer: *it's collapsed.* **"Sure? Try the questions first."** |
| 1:20–1:40 | She taps **Call**. Watch rings, connects. **The card stays on screen while they talk.** She reads question one aloud. |
| 1:40–1:50 | Flip to **Patterns**: *"He gives up on word problems after 4 minutes but stays 12 with geometry — he can't parse the question."* Then the Turkish card: *"Now a parent who can't read German can still coach German homework."* |
| 1:50–2:00 | Child's screen ⑥ — what my parent can see. *"He knows exactly what's shared. We never look anywhere else."* Repo link. Stop. |

No slides. No architecture diagram. No code on screen.

---

## 11. Rubric

| Criteria | Pts | Claim |
|---|---|---|
| **Impact** | 40 | Two real users, one real evening, a problem every parent recognises in a sentence. Works for a parent who can't read the homework — which in this city is a lot of parents. |
| **Working demo** | 20 | Two live devices, real-time, running from two commands in the README. |
| **Technical quality** | 20 | Two clients + ws hub + WebRTC signalling + four typed Claude endpoints with schema validation and an answer-leak guard, server-side keys, graceful degradation at every layer. |
| **Creativity** | 20 | A watch nobody else is building for. An AI whose core feature is **refusing to answer**. Points that buy time with a parent instead of things. A ring that rewards persistence over correctness. |

**The line:** *"Everyone here built AI that does more. We built AI that does less — one hint, then it goes and gets your mum."*

---

## 12. Out of scope — do not build

Accounts · real auth · a database · multiple children · teacher views · curriculum mapping · notifications · real watch hardware · an app store build · dark mode · our own UI chrome translated (only the **card** is translated) · chat · history · streaks · leaderboards.

**After 13:00, the answer to any new feature is no.**

---

## 13. Who does what

| Role | Owns | Done by |
|---|---|---|
| **Builder (Claude Code)** | Both shells, ws hub, four endpoints, WebRTC, fallback | S1–S4 on the clock above |
| **Builder 2 / product** | **The prompts.** Hint quality is the product; a hint that leaks the answer or could fit any problem is a bug. | 14:00 |
| **Domain expert (parent/teacher)** | 5 real worksheets photographed, one in German. Then judge every hint and every ladder: *would this help my kid?* Reject freely. Also: is the persistence ring motivating or stressful? | 12:30, then continuous |
| **Product / design** | Watch face (round, one thing at a time, legible at 200px), the three dots, the collapsed-answer friction, the demo script | 14:00 |
| **Founder** | README, the privacy slide, record at 14:45, submit by 15:30 | 15:30 |

Everyone stops building at **14:45**. The last hour is recording and rehearsal.

---

## 14. Risks

| Risk | Mitigation |
|---|---|
| Scope. This is a lot for 2h45. | Five stages, each demo-able alone. Cut list in §9 decided in advance, no debating on the day. |
| Venue wifi dies | Everything runs on localhost. Tunnel is a bonus, never the path. Pre-generated cards and hints on disk when the API fails. |
| WebRTC eats two hours | Hard stop at 14:30, UI-only call, say so in the README. |
| Claude leaks the answer into a hint | Prompt rule + server-side check that `answer.value` doesn't appear in any hint or ladder item + the domain expert reads every output. |
| "Surveillance tool for parents" in Q&A | §7, and screen ⑥ on the child's watch. Lead with it instead of defending it. |
| "It's a ChatGPT wrapper" | The constraint *is* the product: refusal, ordering, the handover to a human, the watch. Then show the collapsed answer. |

---

## 15. Open — team decides now

1. **Team name** (desk needs it; repo should match)
2. Second demo language — pick one somebody on the team actually speaks, or Q&A gets dangerous
3. No children on camera. Worksheet, watch face, and a parent's voice are enough.
