---
name: implement-ticket
description: Implements one alper ticket, or one set of review findings, on its own branch cut from the integration branch, and hands back a single green commit, or stuck with the failing check. Use when a developer is dispatched with a ticket path or review findings.
metadata:
  type: process
---

# Implement Ticket

## Overview

Takes one ticket from `todo` to a single green commit on its own branch, cut from the **integration branch** the dispatch names. The ticket and the spec are the whole scope; the merger, not the developer, integrates the result. When the checks cannot get green, the honest hand-back is **stuck**, never a red commit.

## When to Use

- **Dispatched with a ticket path** → run the Process.
- **Dispatched with review findings and a cycle number** → run the Process with the findings as the acceptance criteria and the review-fix branch and trailer from [artifacts](../../references/artifacts.md#branches-and-commits).
- **Dispatched as a retry with a stuck report** → run the Process; read the report in step 2 and take a different approach from the one it describes.

## Process

### 1. Cut the branch and install

You start in an isolated worktree based on the repository's default branch, not the integration branch. Switch to your branch, cut from the integration branch your prompt names (a milestone branch):

```bash
git switch -c <branch> <integration-branch>
```

`<branch>` is the ticket's `branch` field, or the review-fix branch for findings. Then run the install command from your prompt, unless it is `none`.

Done when: `git rev-parse --abbrev-ref HEAD` prints your branch, `git merge-base --is-ancestor <integration-branch> HEAD` succeeds, and the install command exited 0.

### 2. Load the ticket

Read the ticket (or findings), the spec sections its Notes name, `GLOSSARY.md`, the coding standards, and the stuck report when your prompt carries one. Find the project's typecheck, test and full-suite commands in its manifest or CI config.

Done when: you can list each acceptance criterion and the command that will prove it.

### 3. Build it test-first

Apply `tdd` to each acceptance criterion in turn. When the ticket or spec leaves a decision open, stop and return the question with your recommended answer.

Done when: every acceptance criterion has a passing test.

### 4. Prove it green

Run typecheck, the ticket's tests, then the full suite. When one cannot be made green within the ticket's scope, stop here and hand back **stuck** (step 6) with that check and its output.

Done when: all three pass, and you have their output; or you are handing back stuck.

### 5. Commit once

Leave the ticket file untouched; `/alper:build` and the merger own it. Squash anything you committed along the way, then make one commit, its message written with `commit` and ending in the `Ticket:` (or `Review-fix:`) trailer:

```bash
git reset --soft <integration-branch>
```

Done when: `git log --oneline <integration-branch>..HEAD` shows exactly one commit.

### 6. Hand back

Return one of:

```
result:    green
branch:    <branch>
worktree:  <output of git rev-parse --show-toplevel>
commit:    <sha>
checks:    typecheck ✓, ticket tests ✓ (<n>), full suite ✓ (<n>)
```

```
result:    stuck
branch:    <branch>
failing:   <typecheck | ticket tests | full suite>: <the command>
output:    <the failing output, trimmed to what shows the failure>
tried:     <each approach taken, one line each>
```

```
result:    questions
questions: <each open decision with your recommended answer>
```

Done when: the report is returned.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The worktree is already on a branch, I'll just work here" | That branch is based on the default branch. Cut yours from the integration branch your prompt names. |
| "I'll cut from `feat/<feature>`, that's the feature" | Tickets land on their milestone branch. Cut from the integration branch in your prompt. |
| "While I'm here I'll fix this nearby code" | Out-of-scope edits create merge conflicts with parallel tickets. Note it in your report instead. |
| "I'll mark the ticket done myself" | The merger marks it done inside the merge commit. Leave the ticket file alone. |
| "The ticket's tests pass, the full suite can wait for the merger" | A red suite blocks the merge. Run it before you hand back. |
| "One test still fails, I'll commit and mention it" | A red commit stalls the merger. Hand back stuck with the failing check. |
| "The retry should try the same fix harder" | The stuck report is what failed. Take a different approach. |

## Red Flags

- A branch whose base is not the integration branch (step 1)
- Tests run before the install command (step 1)
- Edits to files the ticket's slice has no reason to touch (step 3)
- An open decision settled without asking (step 3)
- A green hand-back with no full-suite result, or more than one commit (steps 4–5)
- A commit handed back while a check is red, instead of stuck (step 4)
- A changed ticket file in the diff (step 5)

## Verification

- [ ] The branch was cut from the integration branch and carries exactly one commit, or the hand-back is stuck or questions.
- [ ] The install command ran before the first test, unless it is `none`.
- [ ] Every acceptance criterion has a passing test.
- [ ] Typecheck, the ticket's tests and the full suite pass, with output in the report; or the stuck report names the failing check with its output.
- [ ] The ticket file is unchanged.
- [ ] The hand-back report is complete, with every open decision listed.
