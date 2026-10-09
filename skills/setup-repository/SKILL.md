---
name: setup-repository
description: Prepare a repo for alper once: an agent-workflow block in CLAUDE.md or AGENTS.md, a confirmed GLOSSARY.md, and coding standards when none exist.
disable-model-invocation: true
metadata:
  type: process
---

# Setup Repository

## Overview

Writes the three things every alper skill reads: a pointer block in the repo's agent file, a glossary of terms the user confirmed, and a written coding standard for the Standards reviewer. Re-running it updates the same block and changes nothing else.

## When to Use

- **First use of alper in a repo** → run the Process.
- **Re-run after upgrading alper** → run the Process; step 4 updates the block in place.

## Process

### 1. Explore

Find out:

- which of `CLAUDE.md` and `AGENTS.md` exist at the root, and whether either has an `## Agent workflow` section;
- whether `GLOSSARY.md` or `GLOSSARY-MAP.md` exists;
- every file that documents coding standards (`docs/CODING_STANDARDS.md`, `CONTRIBUTING.md`, a style guide), and the linter, formatter and type-checker configs;
- the domain nouns in the code: entity and type names, table names, route segments.

Done when: you can say, for each of the three outputs, whether it exists, is partial, or is missing.

### 2. Ask in one round

Ask only what exploration left open, in the brainstorm format (`❓` question, lettered options, `✅` recommended letter):

- **Agent file**: only when neither exists: create `CLAUDE.md` or `AGENTS.md`?
- **Glossary**: the 5–15 candidate terms, each with a one-line definition and its `_Avoid_` synonyms; which to keep or correct?
- **Standards**: only when no standards document exists: the draft rules inferred from the configs and the code's visible conventions; keep, correct or drop each?

Done when: the user has answered every question.

### 3. Write the glossary and standards

Apply `domain-modeling` to write the confirmed terms into `GLOSSARY.md`. When standards were drafted, write the confirmed rules to `docs/CODING_STANDARDS.md`, one rule per bullet, leaving out what tooling already enforces.

Done when: both files hold exactly what the user confirmed.

### 4. Write the agent-workflow block

Edit the agent file that exists (`CLAUDE.md` first, then `AGENTS.md`); create one only with the user's choice from step 2. Replace an existing `## Agent workflow` section up to the next `## ` heading, or append one:

```markdown
## Agent workflow

This repo uses the alper plugin: `/alper:brainstorm` → `/alper:spec` → `/alper:build`, and `/alper:review` for any branch.

- Specs and tickets: `docs/.specs/<feature>/`. The directory is hidden from ripgrep's default search; open files by path.
- Domain language: `GLOSSARY.md`. Use its terms in code, specs and tickets.
- Decisions: `docs/adr/`.
- Coding standards: <the standards file>.
```

Done when: the file has exactly one `## Agent workflow` section, and every other line of the file is unchanged.

### 5. Report

List each file created or changed, and what changed.

Done when: the report is delivered.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Create AGENTS.md too, for other tools" | Two agent files drift. Edit the one that exists. |
| "The glossary terms are obvious, write them" | Terms the user did not confirm become wrong vocabulary in every spec. Confirm each one. |
| "Copy the linter rules into the standards" | Tooling already enforces those. Write only what tooling cannot check. |
| "Append the block again, it's simpler" | Re-runs must replace the section, so the file holds exactly one. |

## Red Flags

- A second agent file created next to an existing one (step 4)
- Glossary terms written without the user's confirmation (step 3)
- A duplicated `## Agent workflow` section after a re-run (step 4)
- Changes outside the block in the agent file (step 4)

## Verification

- [ ] Exactly one `## Agent workflow` section exists, in the one agent file.
- [ ] `GLOSSARY.md` holds only confirmed terms, in the glossary format.
- [ ] A standards file exists: the repo's own, or `docs/CODING_STANDARDS.md` with confirmed rules.
- [ ] A second run with no new answers changes no file.
