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

`<branch>` is the ticket's `branch` field, or the review-fix branch for findings. Now read the `## Agent workflow` block from the agent file on disk (`CLAUDE.md`, else `AGENTS.md`): its commands and Gotchas are the integration branch's, newer than the copy loaded when you started. Run its `Install command`, unless it is `none`.

Done when: `git rev-parse --abbrev-ref HEAD` prints your branch, `git merge-base --is-ancestor <integration-branch> HEAD` succeeds, and the install command exited 0.

### 2. Load the ticket

Read the ticket (or findings), `GLOSSARY.md`, the coding standards, and the stuck report when your prompt carries one. Read only the spec sections the ticket's Notes name: list the headings with `grep -n '^## ' <spec>`, then `Read` each section with an offset and limit. Read source files by the range you need, too; every line read stays in your context until you hand back. When the Notes name a `design-patterns/<file>.md`, load the `design-patterns` skill and read that file.

Done when: you can list each acceptance criterion and the test that will prove it.

### 3. Build it test-first

Apply `tdd` to each acceptance criterion in turn. When the ticket or spec leaves a decision open, stop and return the question with your recommended answer.

Done when: every acceptance criterion has a passing test.

### 4. Prove it green

Run the block's `Typecheck command` (unless `none`), its `Test command` with the ticket's tests, then its `Full suite command`. When one cannot be made green within the ticket's scope, stop here and hand back **stuck** (step 6) with that check and its output.

Done when: all three pass, and you have their output; or you are handing back stuck.

### 5. Commit once

Leave the ticket file untouched; `/alper:build` and the merger own it. Squash anything you committed along the way, then load the `commit` skill and make one commit with it, ending in the `Ticket:` (or `Review-fix:`) trailer:

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
gotchas:   <each trap of this repo not yet in Gotchas that cost you a retry, one line each, or none>
```

```
result:    stuck
branch:    <branch>
failing:   <typecheck | ticket tests | full suite>: <the command>
output:    <the failing output, trimmed to what shows the failure>
tried:     <each approach taken, one line each>
gotchas:   <as above>
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
| "I'll read the whole spec, it's safer" | The Notes name the sections your slice needs. Read those. |
| "While I'm here I'll fix this nearby code" | Out-of-scope edits create merge conflicts with parallel tickets. Note it in your report instead. |
| "I'll mark the ticket done myself" | The merger marks it done inside the merge commit. Leave the ticket file alone. |
| "The ticket's tests pass, the full suite can wait for the merger" | A red suite blocks the merge. Run it before you hand back. |
| "One test still fails, I'll commit and mention it" | A red commit stalls the merger. Hand back stuck with the failing check. |
| "The retry should try the same fix harder" | The stuck report is what failed. Take a different approach. |

## Red Flags

- Tests run before the install command (step 1)
- A test or check command found by searching the manifest instead of read from the block (steps 1 and 4)
- Edits to files the ticket's slice has no reason to touch (step 3)
- An open decision settled without asking (step 3)

## Verification

- [ ] The branch was cut from the integration branch and carries exactly one commit, or the hand-back is stuck or questions.
- [ ] The install command ran before the first test, unless it is `none`.
- [ ] Every acceptance criterion has a passing test.
- [ ] Typecheck, the ticket's tests and the full suite pass, with output in the report; or the stuck report names the failing check with its output.
- [ ] The ticket file is unchanged.
- [ ] The hand-back report is complete, with every open decision and every new gotcha listed.
