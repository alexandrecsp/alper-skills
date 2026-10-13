---
name: implement-ticket
description: Implements one alper ticket, or one set of review findings, in the feature's build worktree and hands back a single green commit on the milestone branch, or stuck with the failing check. Use when a developer is dispatched with a ticket path or review findings.
metadata:
  type: process
---

# Implement Ticket

## Overview

Takes one ticket from `in-progress` to a single green commit on the **milestone branch**, in the feature's build worktree the dispatch names. The ticket and the spec are the whole scope. When the checks cannot get green, the honest hand-back is **stuck**, never a red commit; `/alper:build` resets the tree.

## When to Use

- **Dispatched with a ticket path** → run the Process.
- **Dispatched with review findings and a cycle number** → run the Process with the findings as the acceptance criteria and the `Review-fix:` trailer from [artifacts](../../references/artifacts.md#branches-and-commits).
- **Dispatched as a retry with a stuck report** → run the Process; read the report in step 2 and take a different approach from the one it describes.

## Process

### 1. Check the ground

Work only in the worktree your prompt names: run every command there. Confirm it is on the milestone branch with a clean tree, and note `HEAD` as your start commit. Read the `## Agent workflow` block from the agent file on disk (`CLAUDE.md`, else `AGENTS.md`): its commands and Gotchas are the milestone branch's, newer than the copy loaded when you started.

Done when: `git rev-parse --show-toplevel` prints the worktree, `git branch --show-current` prints the milestone branch, and `git status --porcelain` is empty.

### 2. Load the ticket

Read the ticket (or findings), `.sdd/GLOSSARY.md`, the coding standards, and the stuck report when your prompt carries one. Read only the spec sections the ticket's Notes name: list the headings with `grep -n '^## ' <spec>`, then `Read` each section with an offset and limit. Read source files by the range you need, too; every line read stays in your context until you hand back. When the Notes name a `design-patterns/<file>.md`, load the `design-patterns` skill and read that file.

Done when: you can list each acceptance criterion and the test that will prove it.

### 3. Build it test-first

Apply `tdd` to each acceptance criterion in turn. When the ticket or spec leaves a decision open, stop and return the question with your recommended answer. When you change the dependencies, run the block's `Install command`.

Done when: every acceptance criterion has a passing test.

### 4. Prove it green

Run the block's `Typecheck command` (unless `none`), its `Test command` with the ticket's tests, then its `Full suite command`. When one cannot be made green within the ticket's scope, stop here and hand back **stuck** (step 6) with that check and its output, leaving your changes uncommitted.

Done when: all three pass, and you have their output; or you are handing back stuck.

### 5. Commit once

For a ticket, set `status: done` in its file; that is the only edit you make to a ticket file. Squash anything you committed along the way, then load the `commit` skill and make one commit with it, ending in the `Ticket:` (or `Review-fix:`) trailer:

```bash
git reset --soft <start-commit>
```

Done when: `git log --oneline <start-commit>..HEAD` shows exactly one commit and `git status --porcelain` is empty.

### 6. Hand back

Return one of:

```
result:    green
commit:    <sha>
checks:    typecheck ✓, ticket tests ✓ (<n>), full suite ✓ (<n>)
gotchas:   <each trap of this repo not yet in Gotchas that cost you a retry, one line each, or none>
```

```
result:    stuck
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
| "I'll cut a branch for my ticket" | Tickets commit straight on the milestone branch. Stay on the branch your prompt names. |
| "I'll read the whole spec, it's safer" | The Notes name the sections your slice needs. Read those. |
| "While I'm here I'll fix this nearby code" | Out-of-scope edits land unreviewed against any ticket. Note it in your report instead. |
| "The ticket's tests pass, the full suite can wait for the review" | The next ticket starts from your commit. Run the full suite before you hand back. |
| "One test still fails, I'll commit and mention it" | A red commit poisons every later ticket. Hand back stuck with the failing check. |
| "I'll clean up my changes before handing back stuck" | The build resets the tree. Leave it and report what you tried. |
| "The retry should try the same fix harder" | The stuck report is what failed. Take a different approach. |

## Red Flags

- A command run outside the worktree your prompt names (step 1)
- A test or check command found by searching the manifest instead of read from the block (steps 1 and 4)
- Edits to files the ticket's slice has no reason to touch (step 3)
- An open decision settled without asking (step 3)
- A ticket file edited beyond its `status: done` (step 5)

## Verification

- [ ] The work happened in the named worktree, on the milestone branch, and added exactly one commit; or the hand-back is stuck or questions, with nothing committed.
- [ ] Every acceptance criterion has a passing test.
- [ ] Typecheck, the ticket's tests and the full suite pass, with output in the report; or the stuck report names the failing check with its output.
- [ ] For a ticket, its file says `done` inside that commit, and nothing else in it changed.
- [ ] The hand-back report is complete, with every open decision and every new gotcha listed.
