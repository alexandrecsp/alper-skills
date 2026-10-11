---
name: build
argument-hint: "[feature] [mNN] [tNN] [--pause|--no-pause]"
description: Build an approved spec milestone by milestone: tickets in parallel under a cap, one merger, a review per milestone, then land it on the feature branch. mNN or tNN targets one.
disable-model-invocation: true
metadata:
  type: process
---

# Build

## Overview

Orchestrates a feature from approved tickets to a reviewed `feat/<feature>` branch, one **milestone** at a time. Each milestone gets its own milestone branch: `alper:developer`s build its frontier under the **parallel cap**, one `alper:merger` merges finished tickets into it one at a time, `review` checks it on both axes, and only a Clean milestone **lands** on `feat/<feature>`. Ticket files, saved review reports and git trailers are the build's only state, so a stopped build resumes where it left off.

## When to Use

- **`/alper:build [feature]`** → run the whole Process for every milestone not yet landed.
- **`/alper:build [feature] mNN`** → run the Process for milestone NN only, then stop.
- **`/alper:build [feature] tNN`**, or **`mNN tNN`** as a guard that ticket NN is in milestone NN → run steps 1–6 for ticket NN only: no review, no landing.
- **`--pause` or `--no-pause`** → override the `Pause between milestones` setting for this run.
- **A build was interrupted** → run the same command again; steps 2–7 resume it.

Formats, branch names, trailers and settings: [artifacts](../../references/artifacts.md).

## Process

### 1. Check the preconditions

Use the `[feature]` argument; without one, find the feature under `docs/.specs/` (ask when there are several). Check, writing nothing:

- `spec.md` has `status: approved` and `tickets: approved`, and the working tree is clean (`git status --porcelain` empty).
- The `## Agent workflow` block holds all four [build settings](../../references/artifacts.md#build-settings). A missing one → stop and ask the user to re-run `/alper:setup-repository`.
- The breakdown is valid: when the spec declares milestones, every ticket's `milestone` is declared, and every `blocked-by` id is in the same or an earlier milestone. Without a `## Milestones` section, the spec has the implicit milestone `01`, and a ticket naming any other milestone is invalid.
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

### 3. Set up the feature branch

- **`feat/<feature>` does not exist** → run the full suite on the current branch. Red → stop and report the failures, writing nothing. Green → record the current branch as `base` in the spec frontmatter, commit it, then `git switch -c feat/<feature>`.
- **It exists** → continue.

Done when: `feat/<feature>` exists and `base` is recorded.

### 4. Cut or resume the milestone branch

Take the target milestone (plain: the first not yet landed; ticket mode: the ticket's milestone).

- **Its milestone branch does not exist** → `git switch -c milestone/<feature>/m<NN>-<slug> feat/<feature>`.
- **It exists** → switch to it. For each of its `in-progress` tickets: a branch with exactly one commit on top of the milestone branch's history goes to the merger in step 6; otherwise remove any leftover worktree and branch and set the ticket back to `todo`, in one commit.

The main checkout belongs to the build and the merger. It stays on the milestone branch while tickets and fixes merge, and moves to `feat/<feature>` only to land (step 8). Make the build's own commits only while no merger is running.

Done when: the main checkout is on the milestone branch and no `in-progress` ticket is unaccounted for.

### 5. Fill the free slots

The frontier is the milestone's `todo` tickets whose `blocked-by` tickets are all `done` (ticket mode: ticket NN alone). A slot is free while fewer tickets are dispatched-but-unmerged than the `Parallel cap`; a ticket waiting for the merger, or on its Opus retry, still holds its slot.

For each free slot: rank the frontier by the length of the longest dependency chain each ticket heads within the milestone, then by lowest number. Take the first ticket whose `touches` overlap no running ticket's; when every one overlaps, take the first anyway. Set it `in-progress` in its own commit (`build: start NN`), then dispatch one `alper:developer` in the background with: the feature, the integration branch (the milestone branch), the ticket path, its `branch`, and the install command.

- **Frontier empty, nothing running, every ticket of the milestone `done`** → step 7 (ticket mode: step 10).
- **Frontier empty, nothing running, otherwise** → stop: report the `blocked` tickets and why.

Done when: every slot is full, or the frontier is empty.

### 6. Handle each hand-back

- **`green`** → dispatch `alper:merger` with the ticket id, branch, worktree and integration branch, and wait for it before dispatching another merger. `merged` → the slot frees: back to step 5. `blocked` → let running developers finish and merge, then stop and report.
- **`questions`** → put them to the user. Append the answers to `brainstorm.md` as a `Build · t<NN> (<date>):` [follow-up decision](../../references/artifacts.md#follow-up-decisions), commit it on the milestone branch, and resume that developer with the answers.
- **`stuck`, first time** → remove its worktree and branch, and dispatch a fresh `alper:developer` for the same ticket with the model overridden to Opus and the stuck report in its prompt.
- **`stuck` after the Opus retry** → set the ticket `blocked` with a `## Blocked` section naming the failing check, commit it, let running developers finish and merge, then stop and report.

Done when: every ticket of the milestone is `done` (ticket mode: ticket NN), or the build has stopped.

### 7. Review the milestone

When the milestone branch's tip is the commit of its saved report (`reviews/m<NN>-<slug>.md`), act on that report's verdict. Otherwise apply `review` with fixed point `feat/<feature>` and the milestone scope: the milestone's ticket ids, user story numbers and success criteria. Write the combined report to `reviews/m<NN>-<slug>.md` and commit it, replacing any earlier one.

- **Clean** → step 8.
- **Fix, fewer than 2 fix cycles used** (count the milestone's `Review-fix:` trailers) → dispatch one `alper:developer` with the gaps and hard violations, the cycle number, the integration branch and the install command. Handle its hand-back as in step 6, except that stuck after the Opus retry stops the build with the remaining findings. Merge it through `alper:merger`, then review again.
- **Fix, 2 fix cycles used** → stop and report the remaining findings.

Done when: the verdict is Clean, or the build has stopped.

### 8. Land the milestone

Switch the main checkout to `feat/<feature>` and dispatch `alper:merger` with the milestone branch and `feat/<feature>` as the integration branch. Then:

- **It was the last milestone** → step 9.
- **The target was `mNN`** → step 10.
- **Pausing is on** (the setting, or `--pause`; `--no-pause` turns it off) → step 10, with `/alper:build <feature>` as the next step.
- **Otherwise** → step 4 for the next milestone.

Done when: the merger reported the milestone merged, and the next step is chosen.

### 9. Run the final Spec-only check

When the spec declares milestones, apply `review` Spec-only with fixed point `base`, over the whole spec and every ticket. Its findings go in the report; no fix cycle starts. With the implicit milestone, skip it: its milestone review already covered the whole spec.

Done when: the check reported, or it was skipped.

### 10. Report

```
feature:      <feature> on feat/<feature> (from <base>)
milestones:   M<NN> <slug>: landed | in review | building | not started — tickets NN, NN; review clean after <n> fix cycles
final check:  <Spec findings> | none | skipped (no declared milestones) | not yet (milestones remain)
smells:       <judgement calls and extras for the user to decide>
next:         /alper:build <feature> | gh pr create --base <base> --head feat/<feature>
```

Done when: the report is delivered and the turn ends; the user opens the PR.

## Stop conditions

At any step, stop and ask the user when:

- a build setting is missing, or the breakdown is invalid (step 1);
- the base is red on the first run (step 3);
- a ticket is `blocked`, or still stuck after its Opus retry (steps 5–6);
- a fix is still stuck after its Opus retry, or findings remain after 2 fix cycles (step 7);
- a developer or the merger returns a question the spec does not answer;
- the next action is irreversible: a data migration, an auth or permission change, a deletion, anything touching secrets or production, anything `git revert` cannot undo.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I'll implement this small ticket myself, it's faster" | The main checkout belongs to the merger. Every ticket goes through a developer and the merger. |
| "The frontier is wide, dispatch it all now" | The cap protects the merger and the machine. Fill free slots only, one ticket each. |
| "Mark the whole frontier `in-progress` up front" | Ticket files must show what is running. Mark a ticket when its developer is dispatched. |
| "Two developers are done, merge them together" | Merges go one at a time, so each merge is verified alone. |
| "Merge the ticket straight into `feat/<feature>`" | `feat/<feature>` receives only reviewed milestones. Tickets merge into the milestone branch. |
| "M02's first tickets don't need M01, start them now" | A milestone branch is cut only after the previous one lands. Finish and land the current milestone first. |
| "The fix cycles keep finding things, one more round" | Two fix cycles per milestone, then the user decides. Report what is left. |
| "The developer is stuck, retry it on Sonnet again" | One retry, on Opus, from a fresh branch with the stuck report. Then the ticket is blocked. |
| "The user answered, the developer has it, that's enough" | Later tickets and the Spec reviewer need it too. Record it in `brainstorm.md` first. |
| "A setting is missing, the default is fine" | The build never runs on a guessed setting. Stop and ask for `/alper:setup-repository`. |
| "Approval was implied, start the tickets" | Build only from `tickets: approved`. |

## Red Flags

- Anything written before a failed precondition stopped the run (step 1)
- A targeted run that built on an unlanded milestone or an undone blocker (step 2)
- `feat/<feature>` created while the base was red (step 3)
- A milestone branch cut before the previous milestone landed, or a ticket commit or merge on `feat/<feature>` (steps 4 and 6)
- More dispatched-but-unmerged tickets than the `Parallel cap` (step 5)
- A `todo` ticket marked `in-progress` without a dispatched developer (step 5)
- Two overlapping tickets running while a non-overlapping one waited in the frontier (step 5)
- Code edited in the main checkout by anything but the merger, or a build commit made while a merger ran (steps 4 and 6)
- Two mergers running at once (step 6)
- A developer answer missing from `brainstorm.md` (step 6)
- A second Opus retry for the same ticket or fix (steps 6–7)
- A milestone landed without a Clean saved review report, or a third fix cycle (steps 7–8)
- A final Spec-only check that started a fix cycle (step 9)
- An irreversible action taken without the user (stop conditions)

## Verification

- [ ] The build started from an approved spec and approved tickets, on a clean tree, with all four build settings and a valid breakdown.
- [ ] On the first run, the full suite was green on the base before `feat/<feature>` existed.
- [ ] Every milestone branch was cut from `feat/<feature>` after the previous milestone landed.
- [ ] At no point were more tickets dispatched-but-unmerged than the `Parallel cap`, and only dispatched tickets were `in-progress`.
- [ ] Every ticket ran on its own developer and was merged by the merger into its milestone branch, one at a time, with a `--no-ff` commit, or is `blocked` with a reason.
- [ ] Every user answer to a developer is a `Build · t<NN>` entry in `brainstorm.md`.
- [ ] Every landed milestone has a Clean report in `reviews/` and a `--no-ff` merge on `feat/<feature>` with its `Milestone:` trailer, after at most 2 fix cycles.
- [ ] `feat/<feature>` holds only milestone merges after its creation.
- [ ] The final Spec-only check ran once after the last milestone landed, or was skipped for the implicit milestone.
- [ ] The final report lists every milestone's state, the final check and the next command.
