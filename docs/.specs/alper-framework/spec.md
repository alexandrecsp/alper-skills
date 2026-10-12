# Spec: alper — a spec-driven development plugin for Claude Code

Source: the brainstorm confirmed on 2026-10-09. Status: **approved** (2026-10-09); built without tickets, straight from this spec.

## Problem Statement

I build features with agents, and the workflows I borrow (Addy Osmani's `agent-skills`, Matt Pocock's skills) each solve part of the job. Neither gives me one path from a loose idea to a reviewed feature branch: a single interview, a spec, vertical-slice tickets, parallel implementation of whatever is unblocked, safe integration of that parallel work, and one review at the end, at a cost I can afford to run on every feature. Today I glue those steps together by hand, re-explain context at every hand-off, and implement unblocked tickets one at a time.

## Solution

A Claude Code plugin named `alper` that I install into any repository. It gives me four commands that move an idea through `brainstorm → spec → build`, plus `review` and a one-time `setup-repository`:

- `/alper:setup-repository` prepares a repo once: an agent-workflow block in its `CLAUDE.md` or `AGENTS.md`, a seeded `GLOSSARY.md`, and a coding-standards file when the repo documents none.
- `/alper:brainstorm` interviews me in rounds until the idea is a confirmed set of decisions.
- `/alper:spec` has the architect turn those decisions into a spec, then into tickets, pausing for my approval after each.
- `/alper:build` implements the tickets: developers work every unblocked ticket in parallel, each in its own worktree, a merger integrates finished tickets one at a time, and a two-axis review runs once on the finished feature.
- `/alper:review` runs that same two-axis review on any branch.

Specialised agents (architect, developer, merger, code-reviewer) are thin personas; everything they know lives in skills they preload. I approve the spec and the tickets; after that the build runs on its own and stops only when it needs me.

## User Stories

1. As a developer, I want to install one plugin into any repo, so that the whole workflow is available without copying files around.
2. As a developer, I want `/alper:setup-repository` to add a workflow block to whichever of `CLAUDE.md` or `AGENTS.md` already exists, so that every agent session in the repo knows where specs, tickets, the glossary and the standards live.
3. As a developer, I want setup to ask me which file to create when neither exists, so that it never creates a second agent file beside one I already have.
4. As a developer, I want re-running setup to update its block in place, so that upgrades never duplicate it or touch my own sections.
5. As a developer, I want setup to propose `GLOSSARY.md` terms it found in the code and write only the ones I confirm, so that the glossary starts accurate.
6. As a developer, I want setup to draft `docs/CODING_STANDARDS.md` from the repo's linters and visible conventions when no standards document exists, so that the Standards reviewer has something written to check against.
7. As a developer, I want `/alper:brainstorm` to ask in rounds of numbered questions with a recommended answer each, so that I can answer a whole round by number.
8. As a developer, I want brainstorm to look up facts itself and ask me only for decisions, so that my answers are spent on what only I know.
9. As a developer, I want brainstorm to end on a restate I explicitly confirm, including what is out of scope, so that nothing is silently assumed.
10. As a developer, I want `/alper:spec` to turn a confirmed brainstorm into a spec without interviewing me again, so that decisions I already made are not reopened.
11. As a developer, I want the architect to hand back any decision the brainstorm missed instead of guessing it, so that the spec contains only my decisions.
12. As a developer, I want the spec written to `docs/.specs/<feature>/spec.md` using a fixed template with success criteria, so that every spec reads the same and the Spec reviewer can check against it.
13. As a developer, I want to approve the spec before any tickets exist, so that slicing never starts from a spec I would have changed.
14. As a developer, I want the architect to cut the spec into tracer-bullet vertical slices, so that tickets with no shared blockers can run in parallel.
15. As a developer, I want wide refactors sequenced as expand–contract instead of forced into a vertical slice, so that every ticket can still land green.
16. As a developer, I want each ticket in its own file with its status and blockers in frontmatter, so that the build can compute what is unblocked by reading the files alone.
17. As a developer, I want to approve the ticket breakdown before the build starts, so that granularity and blocking edges are mine.
18. As a developer, I want the architect to update `GLOSSARY.md` as terms are settled and write an ADR only for hard-to-reverse, surprising, real trade-offs, so that the domain docs stay small and trustworthy.
19. As a developer, I want `/alper:build` to create `feat/<feature>` from my current branch, so that the feature never touches my base branch until I open the PR.
20. As a developer, I want every unblocked ticket implemented at the same time, each in its own worktree on `ticket/<feature>/<NN-slug>`, so that a feature with independent slices finishes in fewer waves.
21. As a developer, I want developers to work test-first and hand back only with typecheck, the ticket's tests and the full suite green, so that every ticket arrives verified.
22. As a developer, I want one commit per ticket, so that each ticket's change is one readable unit.
23. As a developer, I want a single merger to integrate finished tickets one at a time, so that parallel work never races into the feature branch.
24. As a developer, I want the merger to resolve conflicts using both tickets' acceptance criteria and rerun the full suite, so that integration is verified, not assumed.
25. As a developer, I want each ticket merged with `--no-ff` as one commit carrying a `Ticket: <feature>/NN` trailer, so that I can revert any ticket with one command.
26. As a developer, I want a ticket's dependents to start only after it is merged, so that they branch from integrated code.
27. As a developer, I want the build to stop and tell me when a ticket is blocked, a question isn't answered by the spec, or an action is irreversible, so that I am interrupted only when I am needed.
28. As a developer, I want the build to resume from the ticket files after an interruption, so that a crash costs no finished work.
29. As a developer, I want one two-axis review (Standards and Spec) of the whole feature after the last merge, so that review costs one pass per feature, not one per ticket.
30. As a developer, I want spec gaps and hard standards violations fixed test-first by a developer for at most two cycles, and judgement-call smells only listed for me, so that fixes are bounded and opinions stay mine.
31. As a developer, I want `/alper:build NN` to run a single ticket, so that I can drive the build by hand when I want to.
32. As a developer, I want `/alper:review` on any branch, so that I can review work that never went through the build.
33. As a skill author, I want every skill in the plugin held to the structure contract by `lint-skill.js`, so that the framework stays consistent as it grows.
34. As a skill author, I want `writing-for-agents` shipped in the plugin, so that I can extend the framework from inside any repo.

## Implementation Decisions

Paths below are contracts the skills depend on (artifact locations, plugin layout), not implementation file paths.

### Plugin

- Plugin name `alper`; the repository root is the plugin root, with `.claude-plugin/plugin.json`, `skills/` and `agents/`. Every component is namespaced (`/alper:spec`, `alper:developer`).
- **Commands are skills**, not files in `commands/`: Claude Code recommends `skills/` for new plugins, and a skill can be both typed by me and preloaded by an agent, which a `commands/` file cannot.
- `brainstorm` and `writing-for-agents` move from `.claude/skills/` into `skills/`. `writing-for-agents` keeps its linter, and the README's lint command points at the new path.

### Skills

| Skill | Invocation | Type | Used by |
|---|---|---|---|
| `setup-repository` | user only | process | me |
| `brainstorm` | model + user | process | me, `/alper:spec` (for gaps) |
| `spec` | user only | process | me |
| `build` | user only | process | me |
| `review` | model + user | process | me, `/alper:build` |
| `write-spec` | model | process | architect |
| `write-tickets` | model | process | architect |
| `domain-modeling` | model | process | architect, `setup-repository` |
| `tdd` | model | process | developer |
| `implement-ticket` | model | process | developer |
| `merge-ticket` | model | process | merger |
| `review-standards` | model | reference | code-reviewer |
| `review-spec` | model | reference | code-reviewer |
| `writing-for-agents` | model + user | reference | me |

- Claude Code cannot preload a skill marked `disable-model-invocation: true`, so every skill an agent preloads stays model-invocable. The three orchestration skills (`setup-repository`, `spec`, `build`) are user-only, because they should only run when I type them. `review` stays model-invocable so `build` can invoke it.
- Each piece of know-how lives in exactly one skill; orchestration skills name the skills or agents they use and never restate them.

### Agents

| Agent | Model | Tools | Preloads |
|---|---|---|---|
| `architect` | `opus` | read, search, write docs | `write-spec`, `write-tickets`, `domain-modeling` |
| `developer` | `sonnet` | files, shell, `Monitor`, `Skill`; `isolation: worktree` | `tdd`, `implement-ticket` |
| `merger` | `sonnet` | files, shell, `Monitor`, `Skill` | `merge-ticket` |
| `code-reviewer` | `opus` | read-only | `review-standards`, `review-spec` |

- Agents are thin: role, tools, model and preloaded skills. They hold no process of their own.
- Subagents cannot talk to me. Any agent that hits a decision it cannot make returns it to the orchestrating skill, which asks me (through `brainstorm` when there are several).

### Artifacts

- `docs/.specs/<feature>/brainstorm.md`: the confirmed brainstorm restate. `/alper:spec` saves it there (after I confirm the feature slug) when it is still only in the conversation, because the architect starts with a fresh context and reads files, not the chat.
- `docs/.specs/<feature>/spec.md`: Problem Statement, Solution, User Stories, Implementation Decisions, Testing Decisions (with seams), Out of Scope, Success Criteria.
- `docs/.specs/<feature>/tickets/NN-<slug>.md`: frontmatter `id`, `title`, `status` (`todo | in-progress | done | blocked`), `blocked-by` (list of ids), `branch`; body: What it delivers, Acceptance criteria (checkboxes), Test seams, Notes.
- `docs/.specs` is hidden from ripgrep's default search, so every skill names these paths explicitly instead of searching for them.
- `GLOSSARY.md` at the repo root (no implementation details), ADRs in `docs/adr/` created lazily, `docs/CODING_STANDARDS.md` only when the repo documents no standards.

### `/alper:spec` flow

1. Save the brainstorm restate to `brainstorm.md` if it is not already on disk.
2. Dispatch the architect with the brainstorm path; it writes `spec.md` or returns the decisions it is missing. Missing decisions go to me (via `brainstorm`), then back to the architect.
3. Show me the spec; wait for an explicit approval.
4. Resume the architect to write the tickets; show me the breakdown (title, blocked-by, what it delivers); wait for an explicit approval.

### `/alper:build` flow

1. Require an approved spec and tickets; require a clean working tree.
2. Create `feat/<feature>` from the current branch and switch the main checkout to it. The merger works here; developers never do.
3. Compute the frontier: tickets with `status: todo` whose `blocked-by` are all `done`. Mark them `in-progress` in one commit on the feature branch.
4. Dispatch one developer per frontier ticket, in parallel. Each runs in an isolated worktree and first creates `ticket/<feature>/<NN-slug>` from `feat/<feature>` (worktrees share refs; Claude Code bases isolated worktrees on the default branch, so the developer must switch). Developers never edit ticket files.
5. As each developer hands back green, queue its branch for the merger. One merger at a time: merge `--no-ff`, resolve conflicts against both tickets' acceptance criteria, rerun the full suite, mark the ticket `done` in the merge commit, remove the ticket worktree and branch. When it cannot get green, it marks the ticket `blocked` and the build stops for me.
6. After each merge, recompute the frontier and dispatch newly unblocked tickets.
7. When every ticket is `done`, invoke `review` on `feat/<feature>` against the branch it started from. Spec gaps and hard Standards violations go to one developer working test-first on the feature branch, for at most two cycles; judgement-call smells are listed for me. Unresolved findings after two cycles stop the build.
8. Report: tickets merged, review outcome, the command to open the PR. I open it.

- Stop conditions at any step: a blocked ticket, a question the spec does not answer, or an irreversible action (migrations, auth, deletes, anything `git revert` cannot undo).
- Resume: on start, `in-progress` tickets whose branch has a green commit go to the merger; others are re-dispatched.
- `/alper:build NN` runs steps 2, 4 and 5 for ticket NN only, and skips the review.

### Review

- Matt's two axes, unchanged in substance: **Standards** (the repo's documented standards plus the Fowler smell baseline; the repo overrides the baseline; smells are always judgement calls) and **Spec** (does the diff deliver the spec and tickets).
- `review` dispatches the code-reviewer twice in parallel, one run per axis, against `git diff <base>...HEAD`, and reports both side by side.

## Testing Decisions

The plugin is Markdown and one script, so its seams are its validators and a real run:

- **Structure**: `lint-skill.js` passes on every skill in `skills/`. It gains an agents check: every agent has `name`, `description`, `model`, and every `skills:` entry names a plugin skill that is model-invocable.
- **Plugin**: `claude plugin validate .` passes with no warnings.
- **Behaviour**: an end-to-end run on a small sample repository outside the plugin: setup, brainstorm, spec, then a build of at least three tickets where two share no blockers and one depends on both. The run must show parallel developers, serialized merges with one `--no-ff` commit per ticket, and a single review.
- Prior art: Addy Osmani's `evals/` trigger cases are the model for later per-skill trigger tests; they are not part of this spec.

## Out of Scope

- A tech-lead agent; `/alper:build` is the orchestrator.
- Review per ticket.
- GitHub, GitLab or Linear issue sync.
- Adapters for agent tools other than Claude Code.
- Developers resolving their own merge conflicts.
- Opening the PR into the base branch; I do that.

## Success Criteria

- [ ] The plugin installs into a fresh repo and all five commands appear under `/alper:`.
- [ ] `lint-skill.js` (with the agents check) and `claude plugin validate .` both pass.
- [ ] On the sample repo, setup writes exactly one workflow block, a confirmed glossary, and a standards file only if none existed; a second run changes nothing.
- [ ] `/alper:spec` produces a spec and tickets matching the templates, with two approval stops and no question the brainstorm already answered.
- [ ] `/alper:build` runs the two independent tickets in parallel, merges each with one `--no-ff` commit, starts the dependent ticket only after both merges, and runs one review.
- [ ] Killing the build mid-run and re-running `/alper:build` finishes without redoing merged tickets.
- [ ] A planted spec gap is caught by the Spec axis and fixed within two cycles; a planted smell is listed, not fixed.
