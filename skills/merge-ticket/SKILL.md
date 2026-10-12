---
name: merge-ticket
description: Merges one finished ticket, review-fix or milestone branch into its integration branch with --no-ff, resolves conflicts against the tickets' acceptance criteria, reruns the full suite, and marks the ticket done or blocked. Use when the merger is dispatched with a branch to integrate.
metadata:
  type: process
---

# Merge Ticket

## Overview

Integrates one finished branch into the **integration branch** the dispatch names, so that branch only ever holds green, merged work. Tickets and review fixes merge into their milestone branch; a Clean milestone merges into `feat/<feature>`. Conflicts are resolved against what each ticket promised (its acceptance criteria), not against which side looks newer.

## When to Use

- **Dispatched with a ticket id, branch, worktree path and integration branch** → run the Process.
- **Dispatched with a review-fix branch** → run the Process; skip the ticket-file updates and use the review-fix merge message from [artifacts](../../references/artifacts.md#branches-and-commits).
- **Dispatched with a milestone branch, `feat/<feature>` as the integration branch** → run the Process as a **milestone merge**: skip the ticket-file updates (step 4), commit with title `M<NN> <slug>` and the `Milestone: <feature>/<NN>` trailer, and in step 6 delete the milestone branch only (it has no worktree).

## Process

### 1. Check the ground

You work in the main checkout. Confirm it is on the integration branch with a clean tree, and that the branch to merge is found. For a ticket or review fix, it carries exactly one commit on top of a commit already in the integration branch.

Done when: `git status --porcelain` is empty, `git branch --show-current` prints the integration branch, and the branch is found.

### 2. Merge without committing

```bash
git merge --no-ff --no-commit <branch>
```

Done when: the merge is staged, with or without conflicts.

### 3. Resolve conflicts

For each conflicted hunk, find the ticket that last changed that file on the integration branch: `git log -1 --no-merges --format='%(trailers:key=Ticket,valueonly)' <integration-branch> -- <file>` prints its `<feature>/NN`. Read both tickets' acceptance criteria and write the version that satisfies both.

Done when: no conflict markers remain and every resolved hunk satisfies both tickets' criteria.

### 4. Mark the ticket done

Set the ticket's `status: done` in its file, and stage it with the merge.

Done when: the ticket file is staged with `status: done`.

### 5. Prove it green

Run the `Typecheck command` (unless `none`) and the `Full suite command` from the `## Agent workflow` block on the merged tree.

- **Green** → load the `commit` skill and commit with it: the merged commit's title and trailer (a milestone merge: `M<NN> <slug>` and `Milestone: <feature>/<NN>`), and bullets only when step 3 resolved a conflict.
- **Red, and the fix follows from the two tickets' criteria** → fix, rerun, then commit.
- **Red otherwise** → `git merge --abort`, set the ticket's `status: blocked` with a `## Blocked` section stating the failing check and the conflicting criteria, commit that, and report. A milestone merge has no ticket to block: abort and report.

Done when: the merge is committed green, or the ticket is committed as blocked, or a milestone merge is aborted and reported.

### 6. Clean up

After a successful merge, remove the developer's worktree and the merged branch. The commit is merged, so `--force` only discards untracked build output:

```bash
git worktree remove --force <worktree>   # tickets and review fixes only
git branch -d <branch>
```

Done when: `git worktree list` no longer shows the worktree and the branch is gone.

### 7. Report

```
merged:  ticket NN <title> | review fix <cycle> | milestone NN <slug>
result:  merged <sha> | blocked
checks:  typecheck ✓, full suite ✓ (<n>)
notes:   <conflicts resolved and how, or why it is blocked>
gotchas: <each trap of this repo not yet in Gotchas that cost you a retry, one line each, or none>
```

Done when: the report is returned.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Take theirs, it's the newer ticket" | Newer is not correct. Resolve each hunk so both tickets' criteria hold. |
| "The merge was clean, skip the suite" | Clean text merges can still break behaviour. Run the full suite every time. |
| "Fast-forward keeps history tidy" | Without `--no-ff` a ticket or milestone cannot be reverted in one command. Always `--no-ff`. |
| "Every ticket goes into `feat/<feature>`" | Tickets and fixes merge into their milestone branch. Merge into the integration branch the dispatch names. |
| "I can guess what the ticket meant" | A guess at intent lands untested in the feature. Mark it blocked and let the user decide. |

## Red Flags

- The main checkout on a branch other than the integration branch at merge time (step 1)
- A conflict resolved without reading both tickets (step 3)
- A merge committed while the suite is still running or red (step 5)

## Verification

- [ ] The merge is a `--no-ff` commit into the integration branch with the right title and trailer, or the ticket is committed as `blocked` with a reason, or a milestone merge was aborted and reported.
- [ ] Every conflict was resolved against both tickets' acceptance criteria.
- [ ] Typecheck and the full suite passed on the merged tree.
- [ ] For a ticket, the ticket file says `done` inside the merge commit.
- [ ] The worktree, when there was one, and the merged branch are removed.
