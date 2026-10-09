---
name: commit
description: Writes git commit messages as an imperative title that completes "If applied, this commit will …" and a body of at most three concrete changes. Use when committing, when writing or fixing a commit message, or when a ticket, review-fix or merge commit is made.
metadata:
  type: process
---

# Commit

## Overview

A commit message says what applying the commit does, not what the author touched. The title completes the sentence **"If applied, this commit will …"**; the body lists at most three changes a reader can't get from the title alone, and is left out when there are none.

## When to Use

- **Any commit** → run the Process.
- **A commit inside the alper workflow** (ticket, review fix, merge) → run the Process and end the message with the trailer from [artifacts](../../references/artifacts.md#branches-and-commits).
- **Bookkeeping commits** made by `/alper:build` (`build: start NN, NN`, a ticket marked `blocked`) → use the fixed message from artifacts as is.

## Process

### 1. Check what is staged

Read `git diff --staged`. Stage only what belongs to one change; unstage the rest.

Done when: the staged diff is one change you can name in a single sentence.

### 2. Write the title

Imperative, capitalised, no trailing period, at most 72 characters. Name the behaviour, not the files; ids and other metadata go in trailers (step 3):

| Reads well | Reads badly |
|---|---|
| `Persist sessions in Redis` | `Update session.ts` |
| `Reject expired refresh tokens` | `Ticket 03: token stuff` |
| `Show the cart total in the header` | `Added cart total` |

Read it back as "If applied, this commit will <title>". When the title needs "and", the diff holds two changes: split it, unless a one-commit-per-ticket rule binds you, then name the outcome both serve.

Done when: the sentence reads as correct English and describes the whole staged diff.

### 3. Write the body

Leave a blank line, then 1–3 `-` bullets, wrapped at 72 columns:

- Each bullet is one concrete change the title doesn't already say: a renamed interface, a new rule, a migration, a behaviour on failure.
- Add the reason in the same bullet when the diff doesn't show it.
- Leave out file lists, test results and anything `git show --stat` already prints.

When the title says everything, there are no bullets. A merge commit has bullets only when a conflict was resolved: one per resolution, naming what both sides kept.

Trailers come last, after a blank line, one `Key: value` per line: the workflow ones from artifacts, plus any `Co-Authored-By:` your setup requires. They don't count toward the three bullets.

Done when: the body has 0–3 bullets, each a change or its reason, followed by the required trailers.

### 4. Commit

Pass the message through stdin so the bullets keep their line breaks:

```bash
git commit -F - <<'EOF'
Persist sessions in Redis

- Store sessions under `sess:<id>` with a 24 h TTL, so a restart no
  longer logs every user out
- Fall back to the in-memory store when `REDIS_URL` is unset

Ticket: sessions/03
EOF
```

Done when: `git log -1 --format=%B` prints exactly the title and body you wrote.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The diff speaks for itself" | The title is what `git log --oneline` shows. Write the outcome so a reader never has to open the diff. |
| "More bullets are more helpful" | Three is the ceiling. Keep the changes a reader would miss; drop what the diff or the title already says. |
| "`Fix bug` is enough, it's a small commit" | Small commits need precise titles most. Name the behaviour that is now correct: `Keep the cursor position after save`. |
| "I'll describe what I did" | Describe what the commit does when applied: `Add retry to webhook delivery`, not `Added retries`. |
| "The test results prove it, so I'll paste them" | Results belong in the handback report. The body holds changes and reasons. |

## Red Flags

- A title in past tense, or one that names files instead of behaviour (step 2)
- A title joined with "and" on a commit that could have been split (steps 1–2)
- A title over 72 characters, or ending in a period (step 2)
- A body with more than three bullets, or bullets that restate the title (step 3)
- File lists or test output in the body (step 3)
- A merge commit with a body when no conflict was resolved (step 3)
- A ticket id or other metadata in the title (step 2)
- A workflow commit without its `Ticket:` or `Review-fix:` trailer (step 3)

## Verification

- [ ] "If applied, this commit will <title>" reads as correct English and covers the whole diff.
- [ ] The title is imperative, at most 72 characters, with no trailing period and no ids.
- [ ] The body has 0–3 bullets, each a change or its reason, none restating the title.
- [ ] A workflow commit ends with its trailer from artifacts.
- [ ] `git log -1 --format=%B` matches the message as written.
