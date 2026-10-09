---
name: implement-ticket
description: Implements one alper ticket, or one set of review findings, on its own branch cut from the feature branch, and hands back a single green commit. Use when a developer is dispatched with a ticket path or review findings.
metadata:
  type: process
---

# Implement Ticket

## Overview

Takes one ticket from `todo` to a single green commit on its own branch. The ticket and the spec are the whole scope; the merger, not the developer, integrates the result.

## When to Use

- **Dispatched with a ticket path** → run the Process.
- **Dispatched with review findings and a cycle number** → run the Process with the findings as the acceptance criteria and the review-fix branch and commit names from [artifacts](../../references/artifacts.md).

## Process

### 1. Cut the branch

You start in an isolated worktree based on the repository's default branch, not the feature branch. Switch to your branch, cut from the feature branch:

```bash
git switch -c <branch> feat/<feature>
```

`<branch>` is the ticket's `branch` field, or `fix/<feature>/review-<cycle>` for review findings.

Done when: `git rev-parse --abbrev-ref HEAD` prints your branch and `git merge-base --is-ancestor feat/<feature> HEAD` succeeds.

### 2. Load the ticket

Read the ticket (or findings), the spec sections its Notes name, `GLOSSARY.md`, and the coding standards. Find the project's typecheck, test and full-suite commands in its manifest or CI config.

Done when: you can list each acceptance criterion and the command that will prove it.

### 3. Build it test-first

Apply `tdd` to each acceptance criterion in turn. When the ticket or spec leaves a decision open, stop and return the question with your recommended answer.

Done when: every acceptance criterion has a passing test.

### 4. Prove it green

Run typecheck, the ticket's tests, then the full suite.

Done when: all three pass, and you have their output.

### 5. Commit once

Leave the ticket file untouched; `/alper:build` and the merger own it. Squash anything you committed along the way, then make one commit, its message written with `commit` and ending in the `Ticket:` (or `Review-fix:`) trailer:

```bash
git reset --soft feat/<feature>
```

Done when: `git log --oneline feat/<feature>..HEAD` shows exactly one commit.

### 6. Hand back

Return:

```
branch:    <branch>
worktree:  <output of git rev-parse --show-toplevel>
commit:    <sha>
checks:    typecheck ✓, ticket tests ✓ (<n>), full suite ✓ (<n>)
questions: <none, or the open decisions>
```

Done when: the report is returned.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The worktree is already on a branch, I'll just work here" | That branch is based on the default branch, not the feature. Cut yours from `feat/<feature>` first. |
| "While I'm here I'll fix this nearby code" | Out-of-scope edits create merge conflicts with parallel tickets. Note it in your report instead. |
| "I'll mark the ticket done myself" | The merger marks it done inside the merge commit. Leave the ticket file alone. |
| "The ticket's tests pass, the full suite can wait for the merger" | A red suite blocks the merge. Run it before you hand back. |

## Red Flags

- A branch whose base is not `feat/<feature>` (step 1)
- Edits to files the ticket's slice has no reason to touch (step 3)
- An open decision settled without asking (step 3)
- A handback with no full-suite result, or more than one commit (steps 4–5)
- A changed ticket file in the diff (step 5)

## Verification

- [ ] The branch was cut from `feat/<feature>` and carries exactly one commit.
- [ ] Every acceptance criterion has a passing test.
- [ ] Typecheck, the ticket's tests and the full suite pass, with output in the report.
- [ ] The ticket file is unchanged.
- [ ] The handback report is complete, with every open decision listed.
