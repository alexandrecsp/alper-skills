---
name: diagnose-bug
description: Reproduces a reported bug in a scratch worktree, pins its root cause to file:line with evidence, and hands back a diagnosis report, or not-reproduced, not-a-bug or feature. Use when an investigator is dispatched with a symptom.
metadata:
  type: process
---

# Diagnose Bug

## Overview

Turns a symptom into a **root cause** proven by experiment, in the scratch worktree the dispatch names. Two facts carry the proof: a **reproducer** goes **red** on the bug, and a minimal change at the root cause turns it green. Without both, the honest hand-back is not-reproduced. The fix is never yours: the experiment is discarded, and the developer fixes the bug later through `/alper:spec` and `/alper:build`.

## When to Use

- **Dispatched with a symptom and a scratch worktree** → run the Process.
- **Dispatched again with a previous report and new information** → run the Process; start from the previous report's evidence and use the new information where it failed.
- **Dispatched with the user's rejection of a verdict or root cause** → run the Process with the user's statement as the contract for the expected behaviour.

## Process

### 1. Check the ground

Work only in the worktree your prompt names: run every command there. Read the `## Agent workflow` block from the agent file (`CLAUDE.md`, else `AGENTS.md`): its `Test command` runs your reproducer, and its Gotchas apply here too.

Done when: `git rev-parse --show-toplevel` prints the scratch worktree and `git rev-parse HEAD` prints the commit your prompt names.

### 2. Trace the symptom and its contract

Follow the symptom from its trigger to the code that produces it. Then find what says the behaviour should be: a spec under `.sdd/specs/`, a test, a doc, `.sdd/GLOSSARY.md`. When none says, the user's expectation in your prompt is the contract.

- **A source documents the current behaviour as intended** → hand back `not-a-bug` (step 8), citing it.
- **The expected behaviour was never built** → hand back `feature` (step 8), naming what is missing.

Done when: you can name the entry point that shows the symptom and the source of the expected behaviour, or you are handing back a verdict.

### 3. Reproduce: red

Write one reproducer test at the highest public seam that shows the symptom, in the repo's test framework, named as the expected behaviour. Leave it untracked, so it survives checkouts in step 5. Run it with the `Test command`. When the trigger is slow or manual, find a faster loop first: a narrower seam that still shows the same symptom.

Done when: the reproducer fails, and its failure output shows the symptom, not a setup, import or typo error. When attempts run out, hand back `not-reproduced` (step 8).

### 4. Pin the root cause

List the hypotheses that explain the red output. For each, run the experiment that could falsify it: a log line, a narrower test, a probe value. For the survivor, make the smallest change at its `file:line` and run the reproducer: it goes green. Revert the change, and confirm the reproducer is red again.

Done when: one hypothesis survived, a change at its `file:line` flipped the reproducer green, the change is reverted, and you can state the mechanism in one or two sentences.

### 5. Find the culprit commit

- **Your prompt names a good commit** → `git bisect start <bad> <good>`, then `git bisect run` with the reproducer's test command (exit 125 for a commit that does not build), then `git bisect reset`.
- **Otherwise** → find the last commit that changed the root-cause lines (`git log -L`) and run the reproducer on its parent. Green there makes that commit the culprit.

Return to the dispatched commit afterwards.

Done when: the culprit is named with its sha and title, or the report says why there is none (the bug predates the history checked); and `HEAD` is the dispatched commit again.

### 6. Map the blast radius

Search for every other caller, path or copy that reaches the same root cause.

Done when: each hit is listed with `file:line` and whether it shows the symptom, or the search you ran found none.

### 7. Draft the fix options

Write two or three ways to fix it, each with its trade-off: at the root cause, at the symptom, or with a contract change. Recommend one.

Done when: every option names where it changes code and what it costs, and exactly one is recommended.

### 8. Hand back

Leave the worktree as it is, the reproducer included; `/alper:diagnose` removes it. Return one of:

````
result:       diagnosed
commit:       <sha the reproducer ran on>
reproducer:   <path>
```<lang>
<the reproducer test>
```
red output:   <the failing output, trimmed to what shows the symptom>
root cause:   <file:line> — <the mechanism>
evidence:     <each experiment and what it showed, one line each, the green flip included>
culprit:      <sha> <title> | none: <why>
blast radius: <file:line — shows the symptom or not, one per line> | none: <the search run>
fix options:  A - <option> — <trade-off>
              B - <option> — <trade-off>
recommended:  <letter> — <reason>
````

```
result:       not-reproduced
tried:        <each attempt and its outcome, one line each>
hypotheses:   <each unconfirmed hypothesis, one line each>
missing:      <each piece of information that would let it reproduce>
```

```
result:       not-a-bug | feature
evidence:     <the source documenting the behaviour as intended, with path; or what is missing for a feature>
```

Done when: the report is returned.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The cause is obvious from the code" | Obvious is a hypothesis. Prove it: red reproducer, green flip, red again. |
| "The test passed, so the bug must be elsewhere" | A reproducer that never went red reproduces nothing. Change the seam or the trigger until it shows the symptom. |
| "Mocking the module that looks broken isolates it" | A mock asserts your hypothesis. Reproduce through the public seam where the symptom shows. |
| "I found it, I'll fix it properly while I'm here" | The flip is an experiment. Revert it; the fix goes through the spec and a developer. |
| "Can't reproduce, but I'm fairly sure it's X" | Hand back `not-reproduced` with X under hypotheses and what would confirm it. |
| "The docs disagree with the user, so it's not a bug" | Return `not-a-bug` only with the source cited; the user decides between it and their expectation. |
| "Bisect is slow, the last change looks guilty" | Run the reproducer on the parent. Name a culprit only when it goes green there. |

## Red Flags

- A command run or file written outside the scratch worktree (step 1)
- A reproducer that passed the first time it ran, or failed on setup (step 3)
- A root cause with no green flip in its evidence (step 4)
- A flip change still in the tree at hand-back (step 4)
- A culprit named without the reproducer green on its parent or a bisect (step 5)
- `blast radius: none` with no search named (step 6)
- A commit made in the scratch worktree (any step)

## Verification

- [ ] Every command ran in the scratch worktree, and it holds no commit of yours.
- [ ] A `diagnosed` report has a reproducer seen red on the symptom, a root cause whose change flipped it green and was reverted, a culprit or the reason for none, a searched blast radius, and fix options with one recommended.
- [ ] A `not-reproduced` report lists every attempt and the information that is missing.
- [ ] A `not-a-bug` report cites the source that documents the behaviour as intended; a `feature` report names what is missing.
