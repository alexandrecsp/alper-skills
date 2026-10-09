---
name: build
argument-hint: "[feature] [NN]"
description: Build an approved spec's tickets in parallel waves, merge each through the merger, and review the feature once. "/alper:build [feature] NN" builds one ticket.
disable-model-invocation: true
metadata:
  type: process
---

# Build

## Overview

Orchestrates a feature from approved tickets to a reviewed `feat/<feature>` branch. Every frontier ticket gets its own `alper:developer` at the same time; one `alper:merger` integrates finished tickets one by one; `review` runs once, at the end. The ticket files are the build's only state, so a stopped build resumes where it left off.

## When to Use

- **`/alper:build`** → run the whole Process.
- **`/alper:build [feature] NN`** (a two-digit argument is a ticket) → run steps 1–2, then steps 4–5 for ticket NN only, and skip the review.
- **A build was interrupted** → run the whole Process; step 2 resumes it.

## Process

### 1. Check the preconditions

Use the `[feature]` argument; without one, find the feature under `docs/.specs/` (ask when there are several). Its `spec.md` needs `status: approved` and `tickets: approved`; the working tree must be clean (`git status --porcelain` empty). Paths and formats: [artifacts](../../references/artifacts.md).

Done when: all three hold, or you have stopped and told the user which is missing.

### 2. Set up or resume the feature branch

- **`feat/<feature>` does not exist** → record the current branch as `base` in the spec frontmatter, commit it, then `git switch -c feat/<feature>`.
- **It exists** → switch to it. For each `in-progress` ticket: if its branch exists with exactly one commit on top of `feat/<feature>` history, queue it for the merger (which reruns the suite); otherwise remove any leftover worktree and branch and set the ticket back to `todo`.

Done when: the main checkout is on `feat/<feature>` and `base` is recorded.

### 3. Compute the frontier

The frontier is every `todo` ticket whose `blocked-by` tickets are all `done`. Set them `in-progress` in one commit (`build: start NN, NN`).

- **Frontier empty and every ticket `done`** → go to step 6.
- **Frontier empty otherwise** → stop: report the `blocked` tickets and why.

Done when: the frontier's tickets are `in-progress` and committed.

### 4. Dispatch the developers

In one turn, dispatch one `alper:developer` per frontier ticket, in the background. Each prompt carries: the feature, `feat/<feature>`, the ticket path, and its `branch`.

A developer that returns questions → put them to the user, then resume that developer with the answers.

Done when: every frontier ticket has a developer running or returned.

### 5. Merge as they finish

As each developer returns green, dispatch `alper:merger` with the ticket id, branch and worktree path, and wait for it before dispatching the next merger. After each `merged` report, return to step 3: newly unblocked tickets start while others are still running.

A `blocked` report → let running developers finish and merge, then stop and report.

Done when: every dispatched ticket is `done` or `blocked`.

### 6. Review the feature

Apply `review` on `feat/<feature>` against `base`.

- **Clean** → go to step 7.
- **Fix** → dispatch one `alper:developer` with the gaps and hard violations and the cycle number; merge its branch through `alper:merger`; review again. After two fix cycles with findings left, stop and report them.

Done when: the review is Clean, or two fix cycles have run.

### 7. Report

```
feature:  <feature> on feat/<feature> (from <base>)
merged:   <n> tickets (NN, NN, …)
review:   clean | <findings left>
smells:   <judgement calls and extras for the user to decide>
next:     gh pr create --base <base> --head feat/<feature>
```

Done when: the report is delivered and the turn ends; the user opens the PR.

## Stop conditions

At any step, stop and ask the user when:

- a ticket is `blocked`;
- a developer or the merger returns a question the spec does not answer;
- the next action is irreversible: a data migration, an auth or permission change, a deletion, anything touching secrets or production, anything `git revert` cannot undo.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I'll implement this small ticket myself, it's faster" | The main checkout belongs to the merger. Every ticket goes through a developer and the merger. |
| "Two developers are done, merge them together" | Merges go one at a time, so each merge is verified alone. |
| "Review each ticket as it lands, to be safe" | Review runs once per feature; that is the cost decision. Developers and the merger prove each ticket green. |
| "The fix cycles keep finding things, one more round" | Two cycles, then the user decides. Report what is left. |
| "Approval was implied, start the tickets" | Build only from `tickets: approved`. |

## Red Flags

- Code edited in the main checkout by anything but the merger (step 5)
- Two mergers running at once (step 5)
- A ticket dispatched before its blockers are `done` (step 3)
- A developer dispatched without the feature branch name (step 4)
- A third review fix cycle (step 6)
- An irreversible action taken without the user (stop conditions)

## Verification

- [ ] The build started from an approved spec and approved tickets, on a clean tree.
- [ ] Every ticket ran on its own developer, and every frontier ran in parallel.
- [ ] Every ticket was merged by the merger, one at a time, with a `--no-ff` commit, or is `blocked` with a reason.
- [ ] `review` ran once on the feature, plus at most two fix cycles.
- [ ] The final report lists the merged tickets, the review result and the PR command.
