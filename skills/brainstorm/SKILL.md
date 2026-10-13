---
name: brainstorm
argument-hint: "[topic]"
description: Interviews the user in rounds of numbered questions, each carrying a recommended answer, first on what to build and then on how, until a plan, decision or idea reaches a confirmed shared understanding. Use when the user asks to brainstorm, be interviewed or be grilled, or when another skill reaches decisions only the user can make.
metadata:
  type: process
---

# Brainstorm

## Overview

Questions the user until every decision a plan rests on is theirs and stated, with nothing silently assumed. Questions arrive in **rounds**: each round is the whole **frontier**, every open decision whose prerequisites are already settled. Facts are your job to look up; decisions are the user's to make. The session has two sections, each confirmed before moving on: the **what** (outcome, who, success, scope, constraints), then the **how** (architecture, data, interfaces, patterns, behaviour on failure).

## When to Use

- **The user asks to brainstorm, be interviewed or be grilled** about a plan, decision or idea → run the Process.
- **Another skill reaches decisions only the user can make** → run the Process on those decisions, then return the confirmed summary to that skill.
- **No live user** (CI, scheduled or autonomous runs) → map the tree, then report the open decisions as blockers, leaving each one for the user.
- **The decisions are already made** and need writing down → write the spec or plan directly.

## Process

### 1. Map the design tree

Look up every fact the environment can answer (files, config, docs, commands) first. Then state to the user, in one line each, your **hypothesis** of what they want and the root decisions it rests on, sorted into what and how. That is the top of the **design tree**: every decision, with the decisions that hang off it. Every how decision waits for the what to be confirmed. A purely technical topic still gets a what section: at least its outcome and how success is measured.

Done when: the hypothesis and root decisions are stated under what and how, and no fact you could have looked up is left as a question.

### 2. Ask the frontier

Ask every frontier decision of the current section in one round, then end the turn and wait:

```
**What · round 1**

❓ **Q1 - <title>**: <the question>

- **A** - <option>
- **B** - <option>

✅ **B** - <the one-line reason>

---

❓ **Q2 - <title>**: <the question>

- **A** - <option>
- **B** - <option>
- **C** - <option>

✅ **A** - <the one-line reason>

---

Reply with letters (`1B 2A`), `ok` to take every ✅, or your own answer.
```

- Every question lists at least two lettered options, and the ✅ names exactly one of them. A yes/no decision is **A** - Yes, **B** - No.
- Letters restart at **A** for each question.
- `ok`, or a letter, is a decision: the user picked a concrete option.
- A question whose answer depends on another question in this round belongs to a later round.
- A question that needs a fact gets the fact looked up (read files, run commands, or dispatch a subagent where available). Only the questions downstream of a running lookup wait for it; ask the rest now.
- When the user asks for one at a time, ask one frontier question per turn for the rest of the session.

Done when: the round is sent with every question numbered and recommended, and the turn has ended.

### 3. Fold in the answers

Settle each answered decision, add the decisions it unblocks, and reopen any decision it changes. Some answers need one more move:

| Answer | Next move |
|---|---|
| Convention-shaped ("scalable", "best practice", "the standard way") | Next round, ask: "If you didn't have to justify this to anyone, what would you want?" |
| Delegated ("whatever you think", "you decide") | Re-ask as a choice between two concrete options. |
| Ungrillable: it depends on seeing something (how a flow feels, which layout reads better) | Park the branch and propose the smallest sketch or prototype that would settle it. |
| "I don't know" | Park the branch, or offer a default the user can accept as their decision. |

Repeat steps 2–3 until the section's frontier is empty. When a section's frontier is still growing after four rounds, propose splitting the scope and brainstorming each piece separately.

Done when: every decision in the current section is settled or parked, and its frontier is empty.

### 4. Confirm the what

Write the what back in the user's own words:

```
**What**
- Outcome:      <one line>
- Who:          <who benefits>
- Success:      <how we know it worked>
- Constraint:   <the binding limit>
- Decisions:    <each settled what decision, one line each>
- Out of scope: <what is explicitly not being done>
- Parked:       <each open item and how it gets settled>

Yes / no / refine?
```

The gate is an explicit yes. A correction gets folded in and the block sent again. "Sounds good" or "whatever you think" gets one follow-up: "Anything you'd refine?"

Done when: the user has said yes to the current what block, and `Out of scope` names at least one thing.

### 5. Ask the how

Run steps 2–3 on the how decisions: every technical decision that is the user's to make. Look up how the codebase does it today before asking. An answer that changes a confirmed what decision reopens it: ask it in the next round marked `(reopened)`, and once it settles, go back to step 4 before any more how rounds.

Done when: every how decision is settled or parked, and the what block still holds the user's yes.

### 6. Confirm the whole

Send the confirmed what block unchanged, followed by:

```
**How**
- Decisions:    <each settled how decision, one line each>
- Parked:       <each open item and how it gets settled>

Yes / no / refine?
```

Same gate as step 4.

Done when: the user has said yes to both blocks as sent.

### 7. Hand back

Deliver the confirmed summary and offer the next steps: save it to a file (suggest `.sdd/docs/brainstorm/<topic>.md`; write it only at a path the user confirms), or carry it into a spec or plan. Then end the turn. When another skill called this one, return the summary to it instead.

Done when: the offer is made and the turn ends with nothing built or written beyond what the user approved.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I can answer this one myself" | A fact gets looked up. A decision goes into the round with your recommendation, and the user makes it. |
| "Asking everything at once is faster" | Questions that hang on open answers get answered on guesses. Ask the frontier; the rest waits for its round. |
| "One question per turn is more careful" | Independent questions gain nothing by waiting. Ask the whole frontier unless the user asked for one at a time. |
| "They said sounds good, so that's a yes" | Ask "Anything you'd refine?" and close only on an explicit yes. |
| "The frontier is empty, so I can start building" | The session ends at the confirmed restate and the hand-back offer. End the turn there. |
| "It's a technical change, there's no what" | Ask at least the outcome and how success is measured; they keep the how aimed. |
| "The what is obvious, I'll start on the how" | Every how decision rests on the what. Confirm the what block first. |
| "This how answer only bends the outcome a little" | It changed a what decision. Reopen it and confirm the what again. |
| "This keeps going, so I'll wrap up early" | The tree sets the count. Propose a scope split (step 3) and let the user choose. |

## Red Flags

- A question that a file, config or command could have answered (step 1)
- Two questions in one round where one answer changes the other (step 2)
- A question with no lettered options, or a ✅ that names no single letter (step 2)
- The agent answering its own decision question and moving on (step 2)
- "Sounds good" or "whatever you think" accepted as a final answer (steps 3 and 5)
- A how question asked before the what block got its yes (steps 4–5)
- A what decision changed during the how with no reconfirmed what block (step 5)
- A what block with no `Out of scope` or `Parked` line (step 4)
- Code, a spec, a plan or a file produced before the explicit yes (step 7)
- Rounds getting longer instead of the frontier shrinking (step 3)

## Verification

- [ ] The hypothesis and root decisions were stated, sorted into what and how, before the first round.
- [ ] Every fact the environment could answer was looked up, not asked.
- [ ] Every round held only frontier questions, numbered, each with lettered options and a ✅ naming one letter.
- [ ] Every convention-shaped or delegated answer was probed or re-asked.
- [ ] Every ungrillable or unknown branch is listed under `Parked` with how it gets settled.
- [ ] The what block filled every field in the user's words, including `Out of scope`, and got an explicit yes before the first how round.
- [ ] Every what decision a how answer changed was reopened and the what block reconfirmed.
- [ ] The user gave an explicit yes to the final what and how blocks.
- [ ] The turn ended at the hand-back offer, with nothing written or built that the user didn't approve.
