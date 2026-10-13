---
name: build
argument-hint: "[feature] [mNN] [tNN] [--pause|--no-pause]"
description: "Build an approved spec milestone by milestone in its own worktree: one developer per ticket in order, a review per milestone, then land it on the feature branch. mNN or tNN targets one."
disable-model-invocation: true
metadata:
  type: process
---

# Build

## Overview

Orchestrates a feature from approved tickets to a reviewed `feat/<feature>` branch, one **milestone** at a time, inside the feature's **build worktree** (`.claude/worktrees/<feature>`). Each milestone gets its own milestone branch: one `alper:developer` at a time builds its tickets in number order, each as one commit on that branch; `review` checks the milestone on both axes; and only a Clean milestone **lands** on `feat/<feature>`. The main checkout stays the user's. Ticket files, saved review reports and git trailers are the build's only state, so a stopped build resumes where it left off.

## When to Use

- **`/alper:build [feature]`** → run the whole Process for every milestone not yet landed.
- **`/alper:build [feature] mNN`** → run the Process for milestone NN only, then stop.
- **`/alper:build [feature] tNN`**, or **`mNN tNN`** as a guard that ticket NN is in milestone NN → run steps 1–6 for ticket NN only: no review, no landing.
- **`--pause` or `--no-pause`** → override the `Pause between milestones` setting for this run.
- **A build was interrupted** → run the same command again; steps 3–7 resume it.

Formats, branch names, trailers and settings: [artifacts](../../references/artifacts.md).

## Process

### 1. Check the preconditions

Use the `[feature]` argument; without one, find the feature under `docs/.specs/` (ask when there are several). Check, writing nothing:

- `spec.md` has `status: approved` and `tickets: approved`, and the main checkout is clean (`git status --porcelain` empty).
- The `## Agent workflow` block holds all five [build settings](../../references/artifacts.md#build-settings), and `git check-ignore -q .claude/worktrees/<feature>` succeeds. Either missing → stop and ask the user to re-run `/alper:setup-repository`.
- The breakdown is valid: when the spec declares milestones, every ticket's `milestone` is declared, and every `blocked-by` id is lower than the ticket's own and in the same or an earlier milestone. Without a `## Milestones` section, the spec has the implicit milestone `01`, and a ticket naming any other milestone is invalid.
- With `mNN tNN`, ticket NN's `milestone` is NN.

Done when: every check holds, or you have stopped, named each failed check (each broken ticket by number), and written nothing.

### 2. Pick the target

| Mode | Target | Prerequisites | Already landed |
|---|---|---|---|
| plain | every milestone not yet landed, in order | none | every milestone landed → report it and stop |
| `mNN` | milestone NN | every earlier milestone landed | milestone NN landed → report it and stop |
| `tNN`, `mNN tNN` | ticket NN | every earlier milestone landed; every `blocked-by` ticket `done` | ticket `done` → report it and stop |

A milestone has landed when `feat/<feature>` holds its `Milestone:` trailer. An unmet prerequisite refuses the run and names what must land first and the command that lands it (`/alper:build <feature> mNN` or `/alper:build <feature> tNN`).

Done when: the target is known, or you have reported and stopped with nothing changed.

### 3. Enter the build worktree

- **`feat/<feature>` does not exist** → ask the user which branch to build from, naming each: the default branch (`git symbolic-ref --short refs/remotes/origin/HEAD`, else `main` or `master`), the current branch when it differs, or another they name. Recommend the default branch when it holds the approved spec and tickets, else the current branch. A branch holds them when `git diff --quiet <branch> HEAD -- docs/.specs/<feature>` succeeds; a chosen branch that does not → tell the user the spec and tickets must reach it first, and stop. Then `git worktree add -b feat/<feature> .claude/worktrees/<feature> <base>`, enter it with `EnterWorktree` (`path`), run the `Install command` (unless `none`), then the full suite. Red → `ExitWorktree` (`keep`), remove the worktree and the branch, and stop with the failures. Green → record `<base>` in the spec frontmatter and commit it on `feat/<feature>`.
- **It exists, the worktree does not** → `git worktree add .claude/worktrees/<feature> feat/<feature>`, enter it, and run the `Install command`.
- **Both exist** → enter the worktree.

Every later step runs in the worktree. Developers and reviewers inherit it as their working directory.

Done when: `git rev-parse --show-toplevel` prints the worktree and `base` is recorded.

### 4. Cut or resume the milestone branch

Take the target milestone (plain: the first not yet landed; ticket mode: the ticket's milestone).

- **Its milestone branch does not exist** → `git switch -c milestone/<feature>/m<NN>-<slug> feat/<feature>`.
- **It exists** → switch to it.

A dirty tree means a developer was interrupted: `git reset --hard`, `git clean -fd`, then rerun the `Install command`. An `in-progress` ticket stays `in-progress` and is built next.

Done when: the worktree is on the milestone branch with a clean tree.

### 5. Build the next ticket

The next ticket is the milestone's lowest-numbered `in-progress` or `todo` ticket whose `blocked-by` tickets are all `done` (ticket mode: ticket NN).

- **A `todo` ticket** → set it `in-progress` in its own commit (`build: start NN`).
- **None, and every ticket of the milestone is `done`** → step 7 (ticket mode: step 10).
- **None otherwise** → stop: report the `blocked` tickets and why.

Dispatch one `alper:developer` and wait for its hand-back, with: the feature, the worktree path, the milestone branch and the ticket path. The developer reads the commands and Gotchas from the `## Agent workflow` block itself.

Done when: the developer has handed back, or the build has moved on or stopped.

### 6. Handle the hand-back

Once a hand-back is green or stuck, and after any reset, commit what it carries on the milestone branch: its `gotchas` lines into the block's Gotchas (at most 10 entries, replacing the least useful one when full), and the user's answers to its questions as a `Build · t<NN> (<date>):` [follow-up decision](../../references/artifacts.md#follow-up-decisions) in `brainstorm.md`. Then, by result:

- **`green`** → confirm the tree is clean and `HEAD` carries the ticket's `Ticket:` trailer with the ticket `done`, then back to step 5 (ticket mode: step 10).
- **`questions`** → put them to the user and resume that developer with the answers.
- **`stuck`, first time** → `git reset --hard`, `git clean -fd`, rerun the `Install command`, and dispatch a fresh `alper:developer` for the same ticket with the model overridden to Opus and the stuck report in its prompt.
- **`stuck` after the Opus retry** → reset as above, set the ticket `blocked` with a `## Blocked` section naming the failing check, commit it, then stop and report.

Done when: the ticket is `done` and committed, or the build has stopped.

### 7. Review the milestone

When the milestone branch's tip is the commit of its saved report (`reviews/m<NN>-<slug>.md`), act on that report's verdict. Otherwise apply `review` with fixed point `feat/<feature>` and the milestone scope: the milestone's ticket ids, user story numbers and success criteria. Write the combined report to `reviews/m<NN>-<slug>.md` and commit it, replacing any earlier one.

- **Clean** → step 8.
- **Fix, fewer than 2 fix cycles used** (count the milestone's `Review-fix:` trailers) → dispatch one `alper:developer` with the worktree path, the milestone branch, the gaps and hard violations, and the cycle number. Handle its hand-back as in step 6, except that stuck after the Opus retry resets the tree and stops the build with the remaining findings. Then review again.
- **Fix, 2 fix cycles used** → stop and report the remaining findings.

Done when: the verdict is Clean, or the build has stopped.

### 8. Land the milestone

`git switch feat/<feature>`, then `git merge --no-ff milestone/<feature>/m<NN>-<slug>`, with the message from the `commit` skill: title `M<NN> <slug>` and the `Milestone: <feature>/<NN>` trailer. The milestone branch was cut from the tip of `feat/<feature>`, so the merge is conflict-free and its tree is the reviewed one. Delete the milestone branch with `git branch -d`. Then:

- **It was the last milestone** → step 9.
- **The target was `mNN`** → step 10.
- **Pausing is on** (the setting, or `--pause`; `--no-pause` turns it off) → step 10, with `/clear`, then `/alper:build <feature>` as the next step, so the next milestone starts in a fresh session.
- **Otherwise** → step 4 for the next milestone.

Done when: `feat/<feature>` holds the milestone's `Milestone:` trailer, and the next step is chosen.

### 9. Run the final Spec-only check

When the spec declares milestones, apply `review` Spec-only with fixed point `base`, over the whole spec and every ticket. Its findings go in the report; no fix cycle starts. With the implicit milestone, skip it: its milestone review already covered the whole spec.

Done when: the check reported, or it was skipped.

### 10. Report

```
feature:      <feature> on feat/<feature> (from <base>), worktree .claude/worktrees/<feature>
milestones:   M<NN> <slug>: landed | in review | building | not started — tickets NN, NN; review clean after <n> fix cycles
final check:  <Spec findings> | none | skipped (no declared milestones) | not yet (milestones remain)
smells:       <judgement calls and extras for the user to decide>
next:         /clear, then /alper:build <feature> | gh pr create --base <base> --head feat/<feature>, then git worktree remove .claude/worktrees/<feature> once it merges
```

Done when: the report is delivered and the turn ends; the user opens the PR.

## Stop conditions

Besides the stops in steps 1–7, stop and ask the user before any irreversible action: a data migration, an auth or permission change, a deletion, anything touching secrets or production, anything `git revert` cannot undo.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I'll implement this small ticket myself, it's faster" | Every ticket goes through a developer: a fresh context, test-first, one commit. |
| "These two tickets are independent, dispatch both" | Developers share the worktree. One developer at a time, in number order. |
| "The user is on this branch, so build from it" | The base is the user's call. Ask, naming the default and the current branch. |
| "The main checkout is already here, build in it" | The main checkout is the user's. The build works only in `.claude/worktrees/<feature>`. |
| "Commit the ticket straight onto `feat/<feature>`" | `feat/<feature>` receives only reviewed milestones. Tickets commit on the milestone branch. |
| "M02's first tickets don't need M01, start them now" | A milestone branch is cut only after the previous one lands. Finish and land the current milestone first. |
| "The stuck developer's changes are a head start for the retry" | The retry starts from a clean tree; the stuck report carries what was learned. |
| "The fix cycles keep finding things, one more round" | Two fix cycles per milestone, then the user decides. Report what is left. |
| "The developer is stuck, retry it on Sonnet again" | One retry, on Opus, from a clean tree with the stuck report. Then the ticket is blocked. |
| "I'll paste the lessons from earlier tickets into this prompt" | Prompts are paid per dispatch and lost after it. Record each lesson once in Gotchas; every developer reads the block. |
| "The user answered, the developer has it, that's enough" | Later tickets and the Spec reviewer need it too. Record it in `brainstorm.md`. |
| "A setting is missing, the default is fine" | The build never runs on a guessed setting. Stop and ask for `/alper:setup-repository`. |
| "Approval was implied, start the tickets" | Build only from `tickets: approved`. |

## Red Flags

- Anything written before a failed precondition stopped the run (step 1)
- `feat/<feature>` cut from a base the user did not choose, or one without the approved spec and tickets (step 3)
- A targeted run that built on an unlanded milestone or an undone blocker (step 2)
- A file changed or a commit made in the main checkout after step 3 (steps 3–8)
- Two developers running at once (step 5)
- A dispatch prompt carrying build settings or repo lessons the block already holds (step 5)
- A retry or a blocked commit on a tree the stuck developer left dirty (step 6)
- A second Opus retry for the same ticket or fix (steps 6–7)
- A final Spec-only check that started a fix cycle (step 9)
- An irreversible action taken without the user (stop conditions)

## Verification

- [ ] The build started from an approved spec and approved tickets, on a clean main checkout, with all five build settings, an ignored worktree path and a valid breakdown.
- [ ] On the first run, the user chose the base, it held the approved spec and tickets, and the full suite was green in the new worktree before any ticket started.
- [ ] Nothing was written to the main checkout; every commit was made in `.claude/worktrees/<feature>`.
- [ ] Every milestone branch was cut from `feat/<feature>` after the previous milestone landed.
- [ ] Tickets were built one at a time in number order, each by its own developer as one commit with its `Ticket:` trailer and the ticket `done`, or the ticket is `blocked` with a reason.
- [ ] Every user answer to a developer is a `Build · t<NN>` entry in `brainstorm.md`, and every reported gotcha is in the block's Gotchas.
- [ ] Every landed milestone has a Clean report in `reviews/` and a `--no-ff` merge on `feat/<feature>` with its `Milestone:` trailer, after at most 2 fix cycles.
- [ ] `feat/<feature>` holds only its `base` commit and milestone merges.
- [ ] The final Spec-only check ran once after the last milestone landed, or was skipped for the implicit milestone.
- [ ] The final report lists every milestone's state, the final check and the next command.
