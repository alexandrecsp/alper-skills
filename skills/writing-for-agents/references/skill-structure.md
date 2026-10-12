# Skill structure contract

The structure every skill follows. This file is the source of truth; [`scripts/lint-skill.js`](../scripts/lint-skill.js) mirrors its **lint** rules, and when the two disagree, fix the linter. **Review** rules need judgement and are checked by reading the skill.

```bash
node scripts/lint-skill.js <skill-dir>        # one skill
node scripts/lint-skill.js <skills-root>      # every child directory holding a SKILL.md
node scripts/lint-skill.js <plugin-root>      # skills/, agents/ and cross-references (see Plugins)
node scripts/lint-skill.js --json <path>      # machine-readable report
```

Exit code 0 means no errors; warnings never fail the run.

## Layout

```
<skill-name>/
  SKILL.md        # required; the entry point
  references/     # optional; disclosed reference, one file per branch or topic
  scripts/        # optional; runnable helpers (executing costs no context, only output does)
```

- **Lint:** the directory name is lowercase-hyphen-separated and matches `name`.
- **Lint:** `SKILL.md` is at most 500 lines.
- **Lint (warning):** no empty `references/` or `scripts/` directory.
- **Lint (warning):** every file in `references/` is linked from `SKILL.md`, and every file in `scripts/` is named in `SKILL.md` or a reference file. A file with no pointer is invisible to the agent.
- **Lint (warning):** reference files link back to `SKILL.md` or outward, never to a sibling reference. Keep disclosure one level deep.
- **Lint:** every relative link resolves.
- **Review:** create a reference file only when material serves some branches and not others, or runs past roughly 100 lines. Material every branch needs stays inline.

## Frontmatter

| Key | Rule |
|---|---|
| `name` | **Lint:** required, kebab-case, at most 64 characters, equal to the directory name. |
| `description` | **Lint:** required. Rules depend on invocation (below). |
| `metadata.type` | **Lint:** required; one of `process`, `reference`, `router` (see Skill types). |
| `disable-model-invocation` | Optional. `true` makes the skill user-invoked. |
| `argument-hint` | Optional. The arguments shown in slash-command autocomplete, e.g. `"[feature] [NN]"`. **Review:** the body says what to do with each argument and without it. |
| `license`, `compatibility`, `allowed-tools`, other `metadata.*` | Optional, per the Agent Skills spec. |

**Lint:** no other top-level keys. Runtime-specific settings go under `metadata`.

### Description

The description is the skill's always-loaded context pointer. Its rules depend on who invokes the skill:

- **Model-invoked** (default): the agent fires the skill on its own, and other skills can reach it.
  - **Lint:** at most 1024 characters, and contains an affirmative "Use when …".
  - **Lint (warning):** opens with what the skill does, not with "Use when".
  - **Review:** third person ("Writes…", "Guides…"), then one trigger per branch with synonyms collapsed. Summarise no process steps: an agent given a summary may follow it instead of the body.
- **User-invoked** (`disable-model-invocation: true`): only a human typing the name fires it; no other skill can. Zero context load, paid for in the human's memory.
  - **Lint (warning):** at most 200 characters. It is a one-line human summary with no trigger list.

Make a skill model-invoked only when the agent must reach it alone, or another skill must. Reference shared by two user-invoked skills lives in neither: put it in a plain file both can point at.

## Skill types

Declare the type in `metadata.type`. The type sets the required sections.

| Type | What it is | Required sections (lint) |
|---|---|---|
| `process` | An ordered workflow the agent runs | Overview, When to Use, Process, Common Rationalizations, Red Flags, Verification |
| `reference` | Rules or concepts consulted on demand | Overview, When to Use, Verification, plus at least one body section |
| `router` | Names other skills and when to reach for each | Overview, Routes |

A skill whose steps are only "apply these rules" is a `reference`. A skill that names other skills and holds no rules of its own is a `router`; it is usually user-invoked, so a human remembers one name instead of many.

Any other `##` section is allowed. Required sections may appear in any order, but keep the order of the table unless the skill reads better otherwise.

## Section contracts

Each required section has a bar. A section that clears the lint but fails its review bar is a **no-op**: shorten or rewrite it, don't pad it.

### Overview

- **Purpose:** what the skill does and the one fact that makes it differ from the model's default behaviour.
- **Lint (warning):** at most 5 non-blank lines.
- **Review:** states the defining constraint. Contains no history, motivation essay or restated description.

### When to Use

- **Purpose:** the trigger boundary, written for both the agent and the human.
- **Review:** one bullet per branch. Write exclusions as routes ("for a code review, use `code-review`"), not as bare prohibitions. When a branch needs a reference file, the bullet is its pointer, with the condition in the wording.

### Process

Accepted headings: `Process`, `The Process`, `Core Process`, `Workflow`, `Steps`.

- **Purpose:** the ordered actions, numbered.
- **Review:** each step is an action ("run the focused test"), not advice ("make sure it works"), and ends on a checkable completion criterion. Describe capabilities, never one runtime's private tool names. Reference that only some steps need moves to `references/`.

### Common Rationalizations

- **Purpose:** the excuses an agent uses to skip a step, each paired with why it fails.
- **Lint:** contains a markdown table.
- **Review:** every step that is tempting to skip has a row. Each "Reality" cell states the behaviour to follow, not just why the excuse is wrong. Rows come from observed runs where possible.

### Red Flags

- **Purpose:** observable signs, in the trace or the diff, that the skill is being violated.
- **Lint:** contains a list.
- **Review:** each flag is observable by a reviewer, and each maps to a Process step that states the positive behaviour. A flag with no matching step marks a missing step.

### Verification

- **Purpose:** the exit criteria for the whole skill.
- **Lint:** contains at least one `- [ ]` checkbox.
- **Review:** every box can be proven with evidence (command output, a file, a diff), and the set is exhaustive: "every changed endpoint has a test", not "tests were added". For a reference skill, the bar is "every rule applied".

### Routes

- **Purpose:** the router's table, with a condition in the left column and the skill to reach for in the right.
- **Lint:** contains a markdown table.
- **Review:** conditions don't overlap, and every named skill exists.

## Splitting a skill

Split only when the cut earns its cost:

- **By sequence:** when later steps pull the agent into rushing the current one, and sharpening the completion criterion did not stop it. The split must cross a real context boundary (a handoff or a subagent).
- **By invocation:** when a part has a distinct trigger that should fire on its own, or another skill must reach it. The new description adds permanent context load, so that independent reach has to be worth it.
- **By branch, inside one skill:** move a branch's material to `references/` before reaching for a new skill.

## Plugins

A directory holding `.claude-plugin/plugin.json` is linted as a Claude Code plugin: every skill in `skills/`, every agent in `agents/`, and the references between them.

### Agents

An agent is a thin persona: role, tools, model and preloaded skills. Its know-how lives in the skills it preloads.

| Field | Rule |
|---|---|
| `name` | **Lint:** required, kebab-case. **Lint (warning):** equal to the file name. |
| `description` | **Lint:** required. **Review:** says what the agent does and who dispatches it. |
| `model` | **Lint:** required; `sonnet`, `opus`, `haiku`, `fable`, `inherit` or a `claude-*` id. Cost is a decision, so it is never left to the default. |
| `tools` | **Lint (warning):** missing. Without an allowlist the agent inherits every tool of the session, MCP servers included, and pays their schemas on every turn. |
| `skills` | **Review:** preload only what the agent applies on every run; a skill used at one step (a commit message) or on some branches is loaded with `Skill` when needed. **Lint:** every entry is a skill in this plugin, and none has `disable-model-invocation: true` (Claude Code cannot preload those). |
| `isolation` | **Lint:** only `worktree`. |
| other fields | **Lint (warning):** unknown fields, which Claude Code silently ignores, and `permissionMode`, `mcpServers`, `hooks`, `initialPrompt`, which it ignores for plugin agents. |

- **Review:** the body states the role, the scope boundary, and what the agent returns. A process step in an agent body belongs in a skill.

### Cross-references

- **Lint (warning):** every `<plugin>:<name>` written in a skill or agent names a skill or agent in this plugin.
- **Review:** a skill that dispatches an agent or invokes another skill names it, never restates its process.

## Exit checklist

- [ ] `node scripts/lint-skill.js <skill-dir>` exits 0, and every warning was fixed or deliberately kept.
- [ ] The description passes its review bar for the skill's invocation mode.
- [ ] Every required section clears its review bar above.
- [ ] Every Red Flag maps to a positive Process step.
- [ ] The skill ran on a real task and on a near-miss prompt it should not fire on.
