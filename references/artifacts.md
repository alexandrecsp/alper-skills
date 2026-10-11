# Artifacts

The files, branches and settings every alper skill reads and writes. This file is their single source of truth.

## Layout

```
docs/.specs/<feature>/
  brainstorm.md                  # the confirmed brainstorm: what and how blocks, then follow-up decisions
  spec.md                        # the spec
  tickets/NN-<slug>.md           # one file per ticket
  reviews/m<NN>-<slug>.md        # the latest review report of a milestone
GLOSSARY.md                      # domain language, no implementation details
docs/adr/NNNN-<slug>.md          # decisions, created lazily
docs/CODING_STANDARDS.md         # only when the repo documents no standards elsewhere
docs/drawings/<slug>.html        # a chart or view from /alper:draw when no path was given
```

- `<feature>` is a kebab-case slug the user confirmed. Ticket `NN` is two digits, numbered in dependency order (blockers first). Milestone `NN` is two digits from `01`, in landing order.
- `docs/.specs` is a hidden directory, which ripgrep skips by default. Open these files by exact path, list them with `ls docs/.specs/<feature>/tickets`, or pass `--hidden` to ripgrep.

## Build settings

Four bullets in the repo's `## Agent workflow` block, written by `/alper:setup-repository` and read by `/alper:build`:

```markdown
- Parallel cap: 3
- Parallel test suites: yes
- Pause between milestones: off
- Install command: npm ci
```

| Setting | Values | Default setup recommends |
|---|---|---|
| `Parallel cap` | a positive integer: the most tickets dispatched and not yet merged at once | 3, or 1 when `Parallel test suites` is `no` |
| `Parallel test suites` | `yes` or `no`: can two copies of the full suite run at the same time | `yes` |
| `Pause between milestones` | `on` or `off` | `off` |
| `Install command` | the command that installs dependencies in a fresh worktree, or `none` | derived from the lockfile or manifest |

## Spec frontmatter

```yaml
---
feature: <feature>
status: draft          # draft | approved; set to approved by /alper:spec
tickets: none          # none | draft | approved; set by /alper:spec
base: ""               # the branch /alper:build started from; set by /alper:build
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
branch: ticket/<feature>/03-<slug>
milestone: "01"
touches: ["<module>", "<module>"]
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

- `milestone` names a declared milestone. Every `blocked-by` id is in the same milestone or an earlier one.
- `touches` lists the modules the ticket changes, named as the spec's Implementation Decisions name them. Two tickets **overlap** when their `touches` lists share an entry.

## Ticket status

| Status | Set by | When |
|---|---|---|
| `todo` | architect | the ticket is written |
| `in-progress` | `/alper:build` | a developer is dispatched for it, never before |
| `done` | merger | inside the ticket's merge commit |
| `blocked` | merger or `/alper:build` | the merger cannot get its merge green, or the ticket is still stuck after its Opus retry; a `## Blocked` section appended to the ticket says why |

Only `/alper:build` and the merger write ticket files after the architect; developers read them.

The **frontier** is every `todo` ticket of the current milestone whose every `blocked-by` id is `done`.

## Branches and commits

| Thing | Name |
|---|---|
| Feature branch | `feat/<feature>`, created from `base`; receives only milestone merges |
| Milestone branch | `milestone/<feature>/m<NN>-<slug>`, cut from `feat/<feature>` after the previous milestone landed |
| Ticket branch | the ticket's `branch` field, cut from its milestone branch |
| Review-fix branch | `fix/<feature>/m<NN>-review-<cycle>`, cut from the milestone branch |
| Developer commit | one per ticket or fix cycle; trailer `Ticket: <feature>/NN`, or `Review-fix: <feature>/m<NN>-<cycle>` |
| Ticket and review-fix merge | into the milestone branch, `--no-ff`, the merged commit's title and trailer |
| Milestone merge | into `feat/<feature>`, `--no-ff`, title `M<NN> <slug>`, trailer `Milestone: <feature>/<NN>` |

- The **integration branch** of a ticket or review fix is its milestone branch. `/alper:build` passes it to developers and the merger; for a milestone merge it is `feat/<feature>`.
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
