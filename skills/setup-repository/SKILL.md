---
name: setup-repository
description: "Prepare a repo for alper once: an agent-workflow block with the build and commit settings, and under .sdd/ a confirmed glossary, coding standards and the dashboard, moving a legacy layout there."
disable-model-invocation: true
metadata:
  type: process
---

# Setup Repository

## Overview

Writes the three things every alper skill reads: a pointer block in the repo's agent file carrying the build settings, a glossary of terms the user confirmed, and a written coding standard for the Standards reviewer. It also git-ignores the build worktrees and copies the read-only specs dashboard. Every file it writes lives under `.sdd/` ([layout](../../references/artifacts.md#layout)), except the block and the ignore rule. Re-running it moves a legacy layout into `.sdd/`, updates the same block, asks only for what is missing, and changes nothing else.

## When to Use

- **First use of alper in a repo** → run the Process.
- **Re-run after upgrading alper**, or `/alper:build` stopped on a missing build setting → run the Process; step 2 asks only for the missing settings and step 5 updates the block in place.
- **A repo set up before `.sdd/`** (the [legacy layout](../../references/artifacts.md#layout)) → run the Process; step 3 moves it.

## Process

### 1. Explore

Find out:

- which of `CLAUDE.md` and `AGENTS.md` exist at the root, whether either has an `## Agent workflow` section, and which of the five [build settings](../../references/artifacts.md#build-settings) it already holds, whether it holds the [`Commit title prefix`](../../references/artifacts.md#commit-settings), and which obsolete settings (`Parallel cap`, `Parallel test suites`) it still holds;
- which [legacy paths](../../references/artifacts.md#layout) exist, with the context glossaries a legacy `GLOSSARY-MAP.md` links, and whether `git worktree list` shows a build worktree under `.claude/worktrees/`;
- whether `.gitignore` ignores `.claude/worktrees/`;
- whether `.sdd/dashboard.html` exists and is identical to the plugin's [dashboard](../../assets/dashboard.html);
- whether `.sdd/GLOSSARY.md` or `.sdd/GLOSSARY-MAP.md` exists;
- every file that documents coding standards (`.sdd/docs/CODING_STANDARDS.md`, `CONTRIBUTING.md`, a style guide), and the linter, formatter and type-checker configs;
- the domain nouns in the code: entity and type names, table names, route segments;
- the lockfile or manifest, and the install command it implies (`npm ci`, `pnpm install --frozen-lockfile`, `uv sync`, `bundle install`, …), or `none` when the repo installs nothing;
- the issue key the last 30 commit titles (`git log -30 --format=%s`) start with, if any (`FUNC-1234`, `INC12313`), written as a POSIX extended regex covering every key prefix seen;
- the typecheck, filtered-test and full-suite commands, from the manifest's scripts or the CI config, and whether each prints more than its counts and failures (Unity, Gradle and similar runners print their whole log).

Done when: you can say, for each of the three outputs, the dashboard, each build setting and the commit prefix, whether it exists, is partial, or is missing; you have listed every legacy path present; and you have a candidate for each command and for the prefix (a regex, or `none`).

### 2. Ask in one round

Ask only what exploration left open, in the brainstorm format (`❓` question, lettered options, `✅` recommended letter):

- **Legacy layout**: only when a legacy path exists and no build worktree does: the moves, one `old → new` line each; ✅ move them all, or name the ones to leave (a `docs/adr/` the team kept before alper stays where it is).
- **Agent file**: only when neither exists: create `CLAUDE.md` or `AGENTS.md`?
- **Glossary**: the 5–15 candidate terms, each with a one-line definition and its `_Avoid_` synonyms; which to keep or correct?
- **Standards**: only when no standards document exists: the draft rules inferred from the configs and the code's visible conventions; keep, correct or drop each?
- **Build settings**: one question per setting missing from the block, each recommending the default in [build settings](../../references/artifacts.md#build-settings); each command question offers the derived command to confirm or correct. A test command that prints its whole log gets a second question: ✅ a wrapper script under `.sdd/scripts/` that runs it and prints only the counts and failures, or the raw command.
- **Commit title prefix**: only when the block lacks it: does a team convention require an issue key at the start of every commit title? ✅ the candidate regex, shown with two recent titles it matches; a regex the user writes, with two example keys; or `none`.

Done when: the user has answered every question.

### 3. Move the legacy layout

Skip this step when no legacy path exists, the user kept them all, or a build worktree exists: a running build reads its specs from its own branch, which still holds the legacy paths.

`git mv` each confirmed path to its place in the [layout](../../references/artifacts.md#layout): `.specs/<feature>/` → `.sdd/specs/<feature>/`, `GLOSSARY.md` and `GLOSSARY-MAP.md` → `.sdd/`, each context glossary the map links → `.sdd/glossaries/<context>.md`, and `docs/adr/`, `docs/CODING_STANDARDS.md` and `docs/drawings/` → `.sdd/docs/`, each wrapper → `.sdd/scripts/`. Delete `.specs/dashboard.html`; step 4 copies a fresh one. Every file moves by the same prefix, so relative links between them still resolve; rewrite only the map's links and every mention of an old path inside `.sdd/`. A command in the block that names a moved wrapper takes its new path in step 5.

Done when: no confirmed legacy path exists at its old place, `git status` shows each as a rename into `.sdd/`, no file under `.sdd/` names an old path, and you have listed every file outside `.sdd/` that still does (`git grep`) for the report.

### 4. Write the glossary, standards, wrappers, ignore rule and dashboard

Apply `domain-modeling` to write the confirmed terms into `.sdd/GLOSSARY.md`. When standards were drafted, write the confirmed rules to `.sdd/docs/CODING_STANDARDS.md`, one rule per bullet, leaving out what tooling already enforces. Write each wrapper script the user chose under `.sdd/scripts/`, and run it once. When `.claude/worktrees/` is not ignored, append that line to `.gitignore`. When `.sdd/dashboard.html` is missing or differs from the plugin's [dashboard](../../assets/dashboard.html), copy the plugin's file over it unchanged.

Done when: both files hold exactly what the user confirmed, a confirmed prefix regex matches its two examples under `grep -Eq '^(<pattern>)'`, each wrapper ran and printed only counts and failures, `git check-ignore -q .claude/worktrees/x` succeeds, and `git diff --no-index --quiet <plugin>/assets/dashboard.html .sdd/dashboard.html` succeeds.

### 5. Write the agent-workflow block

Edit the agent file that exists (`CLAUDE.md` first, then `AGENTS.md`); create one only with the user's choice from step 2. Replace an existing `## Agent workflow` section up to the next `## ` heading, or append one:

```markdown
## Agent workflow

This repo uses the alper plugin: `/alper:brainstorm` → `/alper:spec` → `/alper:build`, `/alper:diagnose` in place of the brainstorm for a bug, and `/alper:review` for any branch.

- Alper files: `.sdd/`. The directory is hidden from ripgrep's default search; open files by path.
- Specs and tickets: `.sdd/specs/<feature>/`.
- Domain language: `.sdd/GLOSSARY.md`. Use its terms in code, specs and tickets.
- Decisions: `.sdd/docs/adr/`.
- Coding standards: <the standards file>.
- Pause between milestones: <on|off>
- Install command: <command|none>
- Typecheck command: <command|none>
- Test command: <command with <tests>>
- Full suite command: <command>
- Commit title prefix: <regex|none>
- Gotchas:
```

A setting already in the block, the commit prefix included, keeps its value, and every Gotchas entry stays; only the answers from step 2 and the wrapper paths step 3 moved change the block, and the obsolete settings are dropped.

Done when: the file has exactly one `## Agent workflow` section holding all five build settings, the commit prefix, no obsolete setting, no legacy path, and every earlier Gotchas entry, and every other line of the file is unchanged.

### 6. Report

List each file created, moved or changed, and what changed. List every file outside `.sdd/` that still names a legacy path, for the user to fix. When step 3 was skipped for a build worktree, say the move waits until that build's PR merges and its worktree is removed, then a re-run moves it. When the dashboard was copied, tell the user how to open it: `.sdd/dashboard.html` in a browser, picking the repo root; Chrome and Edge follow a running build live.

Done when: the report is delivered.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Create AGENTS.md too, for other tools" | Two agent files drift. Edit the one that exists. |
| "The glossary terms are obvious, write them" | Terms the user did not confirm become wrong vocabulary in every spec. Confirm each one. |
| "Copy the linter rules into the standards" | Tooling already enforces those. Write only what tooling cannot check. |
| "Append the block again, it's simpler" | Re-runs must replace the section, so the file holds exactly one. |
| "Re-ask every setting so the block is fresh" | The user already chose the existing values. Ask only for settings missing from the block. |
| "The dashboard is already there, skip the copy" | An older copy misreads newer artifacts. Replace it whenever it differs from the plugin's file. |
| "Tweak the dashboard for this repo while copying it" | The next setup run overwrites it. Copy it unchanged; changes belong in the plugin's `assets/dashboard.html`. |
| "I'll guess the install command, the user can fix it later" | A wrong command breaks the build worktree. Derive it, then get the user's confirmation. |
| "The runner's log is fine, a wrapper is extra work" | Every developer reads that log on every run, for the rest of its context. Offer the wrapper. |
| "Leave `.specs/` where it is, it still works" | Every other skill reads only `.sdd/`. Move the legacy layout, or its specs vanish from every skill and the dashboard. |
| "A build is running, but the move is just renames" | The build reads specs from its own branch. Wait until its PR merges and its worktree is gone. |

## Red Flags

- A second agent file created next to an existing one (step 5)
- Glossary terms written without the user's confirmation (step 4)
- A legacy path moved without the user's confirmation, or while a build worktree existed (step 3)
- A duplicated `## Agent workflow` section after a re-run (step 5)
- Changes outside the block in the agent file (step 5)
- A build setting asked again when the block already held it (step 2)
- A command or commit prefix written without the user's confirmation (step 2)
- A `.sdd/dashboard.html` that differs from the plugin's copy after the run (step 4)

## Verification

- [ ] Exactly one `## Agent workflow` section exists, in the one agent file, holding all five build settings, the commit prefix and every earlier Gotchas entry, and naming only `.sdd/` paths.
- [ ] Every legacy path the user confirmed now lives under `.sdd/`, moved with `git mv`, or the report says why the move waits.
- [ ] `.gitignore` ignores `.claude/worktrees/`.
- [ ] `.sdd/dashboard.html` is identical to the plugin's `assets/dashboard.html`.
- [ ] Every build setting and the commit prefix was either already in the block or confirmed by the user, and every command was confirmed.
- [ ] `.sdd/GLOSSARY.md` holds only confirmed terms, in the glossary format.
- [ ] A standards file exists: the repo's own, or `.sdd/docs/CODING_STANDARDS.md` with confirmed rules.
- [ ] A second run with no new answers changes no file.
