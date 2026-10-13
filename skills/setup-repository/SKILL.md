---
name: setup-repository
description: "Prepare a repo for alper once: an agent-workflow block with the build settings, a confirmed GLOSSARY.md, coding standards when none exist, and the specs dashboard."
disable-model-invocation: true
metadata:
  type: process
---

# Setup Repository

## Overview

Writes the three things every alper skill reads: a pointer block in the repo's agent file carrying the build settings, a glossary of terms the user confirmed, and a written coding standard for the Standards reviewer. It also git-ignores the build worktrees and copies the read-only specs dashboard. Re-running it updates the same block, asks only for what is missing, and changes nothing else.

## When to Use

- **First use of alper in a repo** → run the Process.
- **Re-run after upgrading alper**, or `/alper:build` stopped on a missing build setting → run the Process; step 2 asks only for the missing settings and step 4 updates the block in place.

## Process

### 1. Explore

Find out:

- which of `CLAUDE.md` and `AGENTS.md` exist at the root, whether either has an `## Agent workflow` section, and which of the five [build settings](../../references/artifacts.md#build-settings) it already holds, and which obsolete settings (`Parallel cap`, `Parallel test suites`) it still holds;
- whether `.gitignore` ignores `.claude/worktrees/`;
- whether `.specs/dashboard.html` exists and is identical to the plugin's [dashboard](../../assets/dashboard.html);
- whether `GLOSSARY.md` or `GLOSSARY-MAP.md` exists;
- every file that documents coding standards (`docs/CODING_STANDARDS.md`, `CONTRIBUTING.md`, a style guide), and the linter, formatter and type-checker configs;
- the domain nouns in the code: entity and type names, table names, route segments;
- the lockfile or manifest, and the install command it implies (`npm ci`, `pnpm install --frozen-lockfile`, `uv sync`, `bundle install`, …), or `none` when the repo installs nothing;
- the typecheck, filtered-test and full-suite commands, from the manifest's scripts or the CI config, and whether each prints more than its counts and failures (Unity, Gradle and similar runners print their whole log).

Done when: you can say, for each of the three outputs, the dashboard and each build setting, whether it exists, is partial, or is missing, and you have a candidate for each command.

### 2. Ask in one round

Ask only what exploration left open, in the brainstorm format (`❓` question, lettered options, `✅` recommended letter):

- **Agent file**: only when neither exists: create `CLAUDE.md` or `AGENTS.md`?
- **Glossary**: the 5–15 candidate terms, each with a one-line definition and its `_Avoid_` synonyms; which to keep or correct?
- **Standards**: only when no standards document exists: the draft rules inferred from the configs and the code's visible conventions; keep, correct or drop each?
- **Build settings**: one question per setting missing from the block, each recommending the default in [build settings](../../references/artifacts.md#build-settings); each command question offers the derived command to confirm or correct. A test command that prints its whole log gets a second question: ✅ a wrapper script under `scripts/` that runs it and prints only the counts and failures, or the raw command.

Done when: the user has answered every question.

### 3. Write the glossary, standards, wrappers, ignore rule and dashboard

Apply `domain-modeling` to write the confirmed terms into `GLOSSARY.md`. When standards were drafted, write the confirmed rules to `docs/CODING_STANDARDS.md`, one rule per bullet, leaving out what tooling already enforces. Write each wrapper script the user chose, and run it once. When `.claude/worktrees/` is not ignored, append that line to `.gitignore`. When `.specs/dashboard.html` is missing or differs from the plugin's [dashboard](../../assets/dashboard.html), copy the plugin's file over it unchanged.

Done when: both files hold exactly what the user confirmed, each wrapper ran and printed only counts and failures, `git check-ignore -q .claude/worktrees/x` succeeds, and `git diff --no-index --quiet <plugin>/assets/dashboard.html .specs/dashboard.html` succeeds.

### 4. Write the agent-workflow block

Edit the agent file that exists (`CLAUDE.md` first, then `AGENTS.md`); create one only with the user's choice from step 2. Replace an existing `## Agent workflow` section up to the next `## ` heading, or append one:

```markdown
## Agent workflow

This repo uses the alper plugin: `/alper:brainstorm` → `/alper:spec` → `/alper:build`, and `/alper:review` for any branch.

- Specs and tickets: `.specs/<feature>/`. The directory is hidden from ripgrep's default search; open files by path.
- Domain language: `GLOSSARY.md`. Use its terms in code, specs and tickets.
- Decisions: `docs/adr/`.
- Coding standards: <the standards file>.
- Pause between milestones: <on|off>
- Install command: <command|none>
- Typecheck command: <command|none>
- Test command: <command with <tests>>
- Full suite command: <command>
- Gotchas:
```

A setting already in the block keeps its value, and every Gotchas entry stays; only the answers from step 2 change the block, and the obsolete settings are dropped.

Done when: the file has exactly one `## Agent workflow` section holding all five build settings, no obsolete setting, and every earlier Gotchas entry, and every other line of the file is unchanged.

### 5. Report

List each file created or changed, and what changed. When the dashboard was copied, tell the user how to open it: `.specs/dashboard.html` in a browser, picking the repo root; Chrome and Edge follow a running build live.

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

## Red Flags

- A second agent file created next to an existing one (step 4)
- Glossary terms written without the user's confirmation (step 3)
- A duplicated `## Agent workflow` section after a re-run (step 4)
- Changes outside the block in the agent file (step 4)
- A build setting asked again when the block already held it (step 2)
- A command written without the user's confirmation (step 2)
- A `.specs/dashboard.html` that differs from the plugin's copy after the run (step 3)

## Verification

- [ ] Exactly one `## Agent workflow` section exists, in the one agent file, holding all five build settings and every earlier Gotchas entry.
- [ ] `.gitignore` ignores `.claude/worktrees/`.
- [ ] `.specs/dashboard.html` is identical to the plugin's `assets/dashboard.html`.
- [ ] Every build setting was either already in the block or confirmed by the user, and every command was confirmed.
- [ ] `GLOSSARY.md` holds only confirmed terms, in the glossary format.
- [ ] A standards file exists: the repo's own, or `docs/CODING_STANDARDS.md` with confirmed rules.
- [ ] A second run with no new answers changes no file.
