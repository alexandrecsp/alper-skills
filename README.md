# alper

A Claude Code plugin for spec-driven development: `brainstorm → spec → build`, with each feature built ticket by ticket in its own worktree and one two-axis review per milestone.

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
| `/alper:setup-repository` | Once per repo: an agent-workflow block in `CLAUDE.md` or `AGENTS.md` with the build settings (pause, install, typecheck, test and full-suite commands), the commit title prefix regex and the repo's Gotchas, a confirmed `GLOSSARY.md`, coding standards when none exist, `.claude/worktrees/` git-ignored, the [dashboard](#dashboard) at `.specs/dashboard.html` |
| `/alper:brainstorm [topic]` | Interviews you in rounds of recommended questions until a plan is a confirmed set of decisions |
| `/alper:spec [feature]` | The architect writes the spec, then the tickets; you approve each |
| `/alper:build [feature] [mNN] [tNN] [--pause\|--no-pause]` | Milestone by milestone in `.claude/worktrees/<feature>`: one developer per ticket, in order, each committing on the milestone branch; a review gates each milestone before it lands on `feat/<feature>`. `mNN` builds one milestone, `tNN` one ticket |
| `/alper:commit` | Commits the staged change: an imperative title ("If applied, this commit will …"), starting with the issue key the repo's prefix regex requires, and at most three bullets |
| `/alper:review [fixed-point]` | Standards and Spec review of the current branch against a branch, tag or commit (default: the spec's `base`) |
| `/alper:draw [what] [target]` | The drawer draws a Mermaid diagram, chart or standalone HTML view, render-checks it, and writes it in place |

## Dashboard

`/alper:setup-repository` copies [assets/dashboard.html](assets/dashboard.html) to `.specs/dashboard.html`: one HTML file, no server. Open it in a browser and pick the repo root. It shows every feature's stage, its milestones (landed, in review, building), each ticket's status, blockers and acceptance criteria as a list, a kanban board (ready, waiting, in progress, blocked, done, one swimlane per milestone) or a dependency graph, the user stories and spec sections a ticket implements, and the saved reviews. During a build it reads the tickets from `.claude/worktrees/<feature>`, and the git refs to tell which milestones landed. It never writes.

Chrome and Edge read the folder live: with **Live** on, the board follows a running build. Other browsers load a snapshot of the folder. Styles and Markdown come from a CDN, so the page needs a network connection.

## Agents

| Agent | Model | Job | Preloads |
|---|---|---|---|
| `architect` | opus | spec and tickets | `write-spec`, `write-tickets`, `design-patterns`, `domain-modeling` |
| `developer` | sonnet | one ticket, test-first, one commit in the build worktree | `implement-ticket`, `tdd` |
| `code-reviewer` | opus | one review axis per run | `review-standards`, `review-spec` |
| `drawer` | opus | one render-checked diagram, chart or view, written in place | `draw-visual` |

Every agent declares a `tools` allowlist, so it never pays for the session's MCP tools, and loads a skill it needs at one step (`commit`, `design-patterns`) with `Skill` at that step.

Artifacts and branch names: [references/artifacts.md](references/artifacts.md). The design behind all of it: [.specs/alper-framework/spec.md](.specs/alper-framework/spec.md).

## Develop

```bash
claude --plugin-dir .                                          # load the plugin from this checkout
node skills/writing-for-agents/scripts/lint-skill.js .        # skills, agents and cross-references
claude plugin validate .                                       # the manifest
```

Every skill follows [the structure contract](skills/writing-for-agents/references/skill-structure.md).
