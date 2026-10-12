# alper

A Claude Code plugin for spec-driven development: `brainstorm → spec → build`, with parallel ticket builds under a cap, a merger, and one two-axis review per milestone.

## Install

The repo is its own marketplace. In Claude Code:

```
/plugin marketplace add <path-to-this-repo>
/plugin install alper@alper
```

After pulling or editing, `/plugin marketplace update alper` refreshes the installed copy. Once the repo is on GitHub, add it with `/plugin marketplace add <owner>/<repo>` instead.

## Commands

| Command | What it does |
|---|---|
| `/alper:setup-repository` | Once per repo: an agent-workflow block in `CLAUDE.md` or `AGENTS.md` with the build settings (parallel cap, parallel test suites, pause, install, typecheck, test and full-suite commands) and the repo's Gotchas, a confirmed `GLOSSARY.md`, coding standards when none exist |
| `/alper:brainstorm [topic]` | Interviews you in rounds of recommended questions until a plan is a confirmed set of decisions |
| `/alper:spec [feature]` | The architect writes the spec, then the tickets; you approve each |
| `/alper:build [feature] [mNN] [tNN] [--pause\|--no-pause]` | Milestone by milestone: developers build unblocked tickets in parallel under the cap, the merger integrates them one by one into the milestone branch, a review gates each milestone before it lands on `feat/<feature>`. `mNN` builds one milestone, `tNN` one ticket |
| `/alper:commit` | Commits the staged change: an imperative title ("If applied, this commit will …") and at most three bullets |
| `/alper:review [fixed-point]` | Standards and Spec review of the current branch against a branch, tag or commit (default: the spec's `base`) |
| `/alper:draw [what] [target]` | The drawer draws a Mermaid diagram, chart or standalone HTML view, render-checks it, and writes it in place |

## Agents

| Agent | Model | Job | Preloads |
|---|---|---|---|
| `architect` | opus | spec and tickets | `write-spec`, `write-tickets`, `design-patterns`, `domain-modeling` |
| `developer` | sonnet | one ticket, test-first, in its own worktree | `implement-ticket`, `tdd` |
| `merger` | sonnet | one `--no-ff` merge at a time into the milestone branch, or a milestone into `feat/<feature>` | `merge-ticket` |
| `code-reviewer` | opus | one review axis per run | `review-standards`, `review-spec` |

Every agent declares a `tools` allowlist, so it never pays for the session's MCP tools, and loads a skill it needs at one step (`commit`, `design-patterns`) with `Skill` at that step.
| `drawer` | opus | one render-checked diagram, chart or view, written in place | `draw-visual` |

Artifacts and branch names: [references/artifacts.md](references/artifacts.md). The design behind all of it: [docs/.specs/alper-framework/spec.md](docs/.specs/alper-framework/spec.md).

## Develop

```bash
claude --plugin-dir .                                          # load the plugin from this checkout
node skills/writing-for-agents/scripts/lint-skill.js .        # skills, agents and cross-references
claude plugin validate .                                       # the manifest
```

Every skill follows [the structure contract](skills/writing-for-agents/references/skill-structure.md).
