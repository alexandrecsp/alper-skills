---
name: merge-ticket
description: Merges one finished ticket or review-fix branch into feat/<feature> with --no-ff, resolves conflicts against the tickets' acceptance criteria, reruns the full suite, and marks the ticket done or blocked. Use when the merger is dispatched with a branch to integrate.
metadata:
  type: process
---

# Merge Ticket

## Overview

Integrates one finished branch into `feat/<feature>` so the feature branch only ever holds green, merged work. Conflicts are resolved against what each ticket promised (its acceptance criteria), not against which side looks newer.

## When to Use

- **Dispatched with a ticket id, branch and worktree path** → run the Process.
- **Dispatched with a review-fix branch** → run the Process; skip the ticket-file updates and use the review-fix merge message from [artifacts](../../references/artifacts.md).

## Process

### 1. Check the ground

You work in the main checkout. Confirm it is on `feat/<feature>` with a clean tree, and that the branch to merge carries exactly one commit on top of a commit already in `feat/<feature>`.

Done when: `git status --porcelain` is empty, `git branch --show-current` prints `feat/<feature>`, and the branch is found.

### 2. Merge without committing

```bash
git merge --no-ff --no-commit <branch>
```

Done when: the merge is staged, with or without conflicts.

### 3. Resolve conflicts

For each conflicted hunk, find the ticket that last changed that file on the feature branch: `git log -1 --no-merges --format='%(trailers:key=Ticket,valueonly)' feat/<feature> -- <file>` prints its `<feature>/NN`. Read both tickets' acceptance criteria and write the version that satisfies both.

Done when: no conflict markers remain and every resolved hunk satisfies both tickets' criteria.

### 4. Mark the ticket done

Set the ticket's `status: done` in its file, and stage it with the merge.

Done when: the ticket file is staged with `status: done`.

### 5. Prove it green

Run typecheck and the full suite on the merged tree.

- **Green** → commit with `commit`: the ticket commit's title and trailer, and bullets only when step 3 resolved a conflict.
- **Red, and the fix follows from the two tickets' criteria** → fix, rerun, then commit.
- **Red otherwise** → `git merge --abort`, set the ticket's `status: blocked` with a `## Blocked` section stating the failing check and the conflicting criteria, commit that, and report.

Done when: the merge is committed green, or the ticket is committed as blocked.

### 6. Clean up

After a successful merge, remove the developer's worktree and branch. The commit is merged, so `--force` only discards untracked build output:

```bash
git worktree remove --force <worktree>
git branch -d <branch>
```

Done when: `git worktree list` no longer shows the worktree and the branch is gone.

### 7. Report

```
ticket:  NN <title>
result:  merged <sha> | blocked
checks:  typecheck ✓, full suite ✓ (<n>)
notes:   <conflicts resolved and how, or why it is blocked>
```

Done when: the report is returned.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Take theirs, it's the newer ticket" | Newer is not correct. Resolve each hunk so both tickets' criteria hold. |
| "The merge was clean, skip the suite" | Clean text merges can still break behaviour. Run the full suite every time. |
| "Fast-forward keeps history tidy" | Without `--no-ff` a ticket cannot be reverted in one command. Always `--no-ff`. |
| "I can guess what the ticket meant" | A guess at intent lands untested in the feature. Mark it blocked and let the user decide. |

## Red Flags

- A merge commit without `--no-ff`, or with a message off the format (steps 2 and 5)
- A conflict resolved without reading both tickets (step 3)
- A merge committed without a green full-suite run (step 5)
- A ticket marked `done` outside its merge commit (step 4)
- A leftover worktree or branch after a successful merge (step 6)

## Verification

- [ ] The merge is a `--no-ff` commit with the ticket commit's title and `Ticket:` trailer, or the ticket is committed as `blocked` with a reason.
- [ ] Every conflict was resolved against both tickets' acceptance criteria.
- [ ] Typecheck and the full suite passed on the merged tree.
- [ ] The ticket file says `done` inside the merge commit.
- [ ] The worktree and ticket branch are removed.
