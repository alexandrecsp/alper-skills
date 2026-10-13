---
name: diagnose
argument-hint: "[symptom]"
description: Diagnose a reported bug via the investigator, confirm its root cause and fix with you, and write diagnose.md for /alper:spec.
disable-model-invocation: true
metadata:
  type: process
---

# Diagnose

## Overview

Turns a reported symptom into a confirmed **diagnosis**: `.sdd/specs/fix-<slug>/diagnose.md`, the decision record `/alper:spec` builds a fix from. The `alper:investigator` reproduces and proves the root cause in a scratch worktree, and it cannot talk to the user; so this skill gathers the symptom first, and the user confirms the root cause and chooses the fix after. Nothing is fixed here.

## When to Use

- **The user runs `/alper:diagnose`** with a symptom, or right after describing one → run the Process.
- **The behaviour turns out to be missing, not broken** → step 5 routes it to `/alper:brainstorm`.
- **A bug the user already understands, with the fix decided** → `/alper:brainstorm` and `/alper:spec` take it as a feature.

Formats and paths: [artifacts](../../references/artifacts.md).

## Process

### 1. Check the preconditions

The `## Agent workflow` block in `CLAUDE.md` or `AGENTS.md` holds the `Install command` and the `Test command`, and `git check-ignore -q .claude/worktrees/x` succeeds. Either missing → stop and ask the user to run `/alper:setup-repository`.

Done when: both hold, or you have stopped with the missing one named and nothing written.

### 2. Take the symptom

Take the symptom from the argument and the conversation. Ask, in one round of numbered questions, only for what is still missing:

- what the user expected, and what happened instead;
- how to trigger it;
- the commit or branch it shows on (default: `HEAD`, named with its short sha); when the main checkout is dirty, whether the bug needs those uncommitted changes, since a worktree holds only commits;
- a commit where it did not happen, if one is known;
- the error output or logs. Write any that live only in the conversation to a file in a temporary directory, and keep its path.

In the same round, propose the `<slug>`: kebab-case, naming the wrong behaviour. The feature is `fix-<slug>`, and `.sdd/specs/fix-<slug>/` must not exist yet.

Done when: each item has an answer or "unknown", and the user confirmed a slug whose feature directory is free.

### 3. Open the scratch worktree

`git worktree add --detach .claude/worktrees/diagnose-<slug> <commit>`, then run the `Install command` there (unless `none`). On a re-dispatch, reuse the worktree as it is.

Done when: `git -C .claude/worktrees/diagnose-<slug> rev-parse HEAD` prints the commit and the install succeeded.

### 4. Dispatch the investigator

Dispatch `alper:investigator`: "Apply `diagnose-bug` in `.claude/worktrees/diagnose-<slug>` at `<commit>`", with the symptom answers from step 2, the log file paths and the good commit. On a re-dispatch, add the previous report and the new information or the user's objection.

Done when: the investigator has returned its report.

### 5. Act on the result

- **`diagnosed`** → step 6.
- **`not-reproduced`** → show the user what was tried, the hypotheses and what is missing, and ask for it. New information → step 4. None → step 8, with no diagnosis.
- **`not-a-bug`** → show the cited source. The user keeps the verdict → step 8. The user says their expectation is the contract → step 4, with that statement.
- **`feature`** → show what is missing and offer `/alper:brainstorm` for it; step 8.

Done when: the result is diagnosed, or the user has answered and the next step is chosen.

### 6. Confirm the root cause and the fix

Show the report: the root cause with its mechanism, the evidence, the reproducer and its red output, the culprit and the blast radius. Then ask one round in the question format of [brainstorm step 2](../brainstorm/SKILL.md#2-ask-the-frontier):

- **Root cause**: does it explain what the user saw? ✅ **A** - Yes.
- **Fix**: the report's options, ✅ on its recommendation.
- **Scope**: only when the blast radius has hits: which ones the fix covers. ✅ every hit that shows the symptom.

A "no" on the root cause → step 4, with the user's objection. Close only on an explicit yes and a chosen letter.

Done when: the user said yes to the root cause, chose a fix, and settled each blast-radius hit.

### 7. Write the diagnosis

Write `.sdd/specs/fix-<slug>/diagnose.md` in the [diagnosis format](../../references/artifacts.md#diagnosis-file), from the report and the user's answers.

Done when: the file exists, every section holds the report's content unchanged, `Fix options` marks the user's choice, and `Out of Scope` lists each hit the user left out.

### 8. Close

Remove the scratch worktree with `git worktree remove --force .claude/worktrees/diagnose-<slug>`. Report:

```
result:  diagnosed | not reproduced | not a bug | feature
file:    .sdd/specs/fix-<slug>/diagnose.md | none
next:    /alper:spec fix-<slug> | /alper:brainstorm <topic> | none
```

Done when: `git worktree list` no longer shows the scratch worktree, the report is delivered, and the turn ends.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I can see the bug from here, I'll diagnose it myself" | Dispatch the investigator. It proves the cause in a scratch worktree with a fresh context. |
| "The symptom is clear enough, skip the questions" | Each missing fact costs a whole investigator run. Ask the round for what is missing. |
| "The fix is one line, I'll apply it" | The fix goes through `/alper:spec` and `/alper:build`, test-first and reviewed. Write the diagnosis and offer the spec. |
| "The investigator's recommended fix is fine" | The fix is the user's choice. Ask, with the recommendation marked. |
| "Dispatch again, it may reproduce this time" | The same inputs give the same run. Dispatch again only with new information or the user's objection. |
| "The main checkout already has the code, reproduce there" | The main checkout is the user's. Reproduce only in the scratch worktree. |
| "It's not reproduced, but write the diagnosis with the likeliest cause" | A guessed cause becomes a wrong spec. Close with no diagnosis. |

## Red Flags

- The investigator dispatched while an intake item the user could answer was still open (step 2)
- A file changed in the main checkout other than `diagnose.md` (steps 3–7)
- A re-dispatch with no new information and no objection (step 5)
- `diagnose.md` written for a result other than diagnosed, or before the explicit yes and the chosen fix (steps 6–7)
- A fix applied, or `/alper:spec` started, from this skill (step 8)
- A scratch worktree left behind (step 8)

## Verification

- [ ] The preconditions held before anything was written.
- [ ] The investigator received every intake answer, the log paths and the good commit.
- [ ] Every re-dispatch carried new information or the user's objection.
- [ ] `diagnose.md` exists only for a diagnosed result, after the user's yes on the root cause and a chosen fix, and matches the report.
- [ ] The main checkout holds no change besides `diagnose.md`, and no scratch worktree remains.
- [ ] The turn ended with the next command offered and not started.
