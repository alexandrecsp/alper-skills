# Artifacts

The files, branches and settings every alper skill reads and writes. This file is their single source of truth.

## Layout

```
.sdd/
  specs/<feature>/
    brainstorm.md                # the confirmed brainstorm: what and how blocks, then follow-up decisions
    spec.md                      # the spec
    tickets/NN-<slug>.md         # one file per ticket
    reviews/m<NN>-<slug>.md      # the latest review report of a milestone
  dashboard.html                 # read-only dashboard over every feature; copied by /alper:setup-repository
  GLOSSARY.md                    # domain language, no implementation details
  GLOSSARY-MAP.md                # replaces GLOSSARY.md when the repo has several contexts
  glossaries/<context>.md        # one glossary per context named in GLOSSARY-MAP.md
  docs/adr/NNNN-<slug>.md        # decisions, created lazily
  docs/CODING_STANDARDS.md       # only when the repo documents no standards elsewhere
  docs/drawings/<slug>.html      # a chart or view from /alper:draw when no path was given
  scripts/<name>                 # test-runner wrappers written by /alper:setup-repository
.claude/worktrees/<feature>/     # the build worktree /alper:build works in; git-ignored
```

- Every file alper writes lives under `.sdd/`, except the `## Agent workflow` block in `CLAUDE.md` or `AGENTS.md`, the `.gitignore` line, and the build worktree.
- `<feature>` is a kebab-case slug the user confirmed. Ticket `NN` is two digits, numbered in dependency order (blockers first). Milestone `NN` is two digits from `01`, in landing order.
- The dashboard is the plugin's [`assets/dashboard.html`](../assets/dashboard.html), copied unchanged. It parses the formats in this file, so a format change updates it too.
- `.sdd` is a hidden directory, which ripgrep skips by default. Open these files by exact path, list them with `ls .sdd/specs/<feature>/tickets`, or pass `--hidden` to ripgrep.
- **Legacy layout**: repos set up before `.sdd/` hold the same files at `.specs/`, `GLOSSARY.md`, `GLOSSARY-MAP.md`, `docs/adr/`, `docs/CODING_STANDARDS.md`, `docs/drawings/`, and the wrappers the block names under `scripts/`. `/alper:setup-repository` moves them; every other skill reads only `.sdd/`.

## Build settings

Five bullets and a Gotchas list in the repo's `## Agent workflow` block, written by `/alper:setup-repository` and read by `/alper:build` and the developers:

```markdown
- Pause between milestones: on
- Install command: npm ci
- Typecheck command: npx tsc --noEmit
- Test command: npx vitest run <tests>
- Full suite command: npm test
- Gotchas:
  - <a trap of this repo every agent hits, one line>
```

| Setting | Values | Default setup recommends |
|---|---|---|
| `Pause between milestones` | `on` or `off`. `on` ends the run after each landed milestone, so the next one starts in a fresh session | `on` |
| `Install command` | the command that installs dependencies in the build worktree, or `none` | derived from the lockfile or manifest |
| `Typecheck command` | the command that typechecks or compiles the project, or `none` | derived from the manifest or CI config |
| `Test command` | the command that runs only the tests named in place of `<tests>` | derived from the manifest or CI config |
| `Full suite command` | the command that runs every test | derived from the manifest or CI config |

- Each test command prints the pass and fail counts and the failures, and little else. A runner that prints its whole log gets a wrapper script under `.sdd/scripts/` that does, and the setting names the wrapper.
- **Gotchas** are optional: at most 10 one-line traps of this repo (a tool that breaks in worktrees, a name clash, files never to commit). `/alper:build` adds one when a hand-back reports it, replacing the least useful entry when the list is full. Agents read them from the block; dispatch prompts never repeat them.

## Commit settings

One bullet in the same `## Agent workflow` block, written by `/alper:setup-repository` and read by the `commit` skill:

```markdown
- Commit title prefix: (FUNC-|PRB-|INC)[0-9]+[ ]
```

| Setting | Values | Default setup recommends |
|---|---|---|
| `Commit title prefix` | a POSIX extended regex for the issue key the team's own convention puts at the start of every commit title (`FUNC-1234`, `INC12313`, `PRB-47848`), or `none` | the key pattern the repo's last 30 titles share, else `none` |

- The value runs to the end of the line and is never quoted; a trailing space is written `[ ]`, since editors strip trailing whitespace. A missing setting means `none`: titles carry no key, and no skill asks for one or stops over it.
- Check a title with `printf '%s\n' "<title>" | grep -Eq '^(<pattern>)'`.
- With a regex set, every commit title starts with a key, the fixed ones (`build: start NN`, `M<NN> <slug>`) included. A feature's key lives in its spec's `issue` field, so every commit `/alper:build` makes for it carries the same key.

## Spec frontmatter

```yaml
---
feature: <feature>
status: draft          # draft | approved; set to approved by /alper:spec
tickets: none          # none | draft | approved; set by /alper:spec
base: ""               # the branch the user chose to build from; set by /alper:build
issue: ""              # the issue key every commit title of the feature starts with; set by /alper:build when a Commit title prefix is set
---
```

## Milestones section

Every spec `write-spec` writes has this section, between `## User Stories` and `## Implementation Decisions`:

```markdown
## Milestones

### M01 <slug>
- User stories: <story numbers>
- Success criteria: <the Success Criteria this milestone makes checkable>
```

- Every user story belongs to exactly one milestone. A Success Criterion listed under no milestone is checked by the final Spec-only check only.
- **Implicit milestone**: a spec with no `## Milestones` section (one written before milestones existed) has one milestone, `01`, whose slug is `<feature>`. Its tickets need no `milestone` field.

## Ticket file

```markdown
---
id: "03"
title: <short title>
status: todo
blocked-by: ["01", "02"]
milestone: "01"
---

## What it delivers

<the end-to-end behaviour this slice makes work>

## Acceptance criteria

- [ ] <an observable behaviour a test can prove>

## Test seams

<the public interface the tests go through: the highest existing seam>

## Notes

<prefactoring, gotchas, the spec sections this ticket implements, and each
 design-patterns file it applies, as `design-patterns/<file>.md`>
```

- `milestone` names a declared milestone. Every `blocked-by` id is lower than the ticket's own and in the same milestone or an earlier one, so number order is a valid build order.

## Ticket status

| Status | Set by | When |
|---|---|---|
| `todo` | architect | the ticket is written |
| `in-progress` | `/alper:build` | its developer is dispatched, never before |
| `done` | developer | inside the ticket's commit |
| `blocked` | `/alper:build` | the ticket is still stuck after its Opus retry; a `## Blocked` section appended to the ticket says why |

After the architect, only `/alper:build` writes ticket files, except the developer's `status: done`.

## Branches and commits

| Thing | Name |
|---|---|
| Feature branch | `feat/<feature>`, created from `base`; receives only milestone merges |
| Milestone branch | `milestone/<feature>/m<NN>-<slug>`, cut from `feat/<feature>` after the previous milestone landed; deleted once it lands |
| Developer commit | on the milestone branch, one per ticket or fix cycle; trailer `Ticket: <feature>/NN`, or `Review-fix: <feature>/m<NN>-<cycle>` |
| Milestone merge | into `feat/<feature>`, `--no-ff`, title `M<NN> <slug>`, trailer `Milestone: <feature>/<NN>` |

- Both branches are checked out only in the build worktree, never in the main checkout.
- A milestone has **landed** exactly when `feat/<feature>` holds a merge commit with its `Milestone: <feature>/<NN>` trailer.
- The **fix cycles used** by a milestone are its `Review-fix: <feature>/m<NN>-<cycle>` trailers on the milestone branch.

Titles and bodies follow the `commit` skill. Read a trailer with `git log --format='%(trailers:key=Ticket,valueonly)'` (or `key=Milestone`, `key=Review-fix`).

## Review report

`/alper:build` writes each milestone review's combined report to `reviews/m<NN>-<slug>.md` and commits it on the milestone branch. A later review of the same milestone replaces the file in a new commit, so the file holds the latest verdict and git history holds the earlier ones.

## Follow-up decisions

Decisions the user makes after the brainstorm was confirmed are appended to `brainstorm.md` under `## Follow-up decisions`, one entry per occasion, each listing every question and its answer:

- `Spec · round <n> (<date>):` for gap questions the architect returned during `/alper:spec`;
- `Build · t<NN> (<date>):` for questions a developer returned during `/alper:build`, committed on the milestone branch.

The approved spec is never edited during a build.

## Draw marker

A request for the drawer, left in a markdown file where the drawing belongs:

```markdown
<!-- draw: <what to draw>, from <its source: modules, a spec section, data> -->
```

The architect writes markers in `spec.md`; `/alper:spec` dispatches the drawer, which replaces each one with the drawing.
