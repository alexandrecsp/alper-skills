# Artifacts

The files and branches every alper skill reads and writes. This file is their single source of truth.

## Layout

```
docs/.specs/<feature>/
  brainstorm.md            # the confirmed brainstorm: what and how blocks
  spec.md                  # the spec
  tickets/NN-<slug>.md     # one file per ticket
GLOSSARY.md                # domain language, no implementation details
docs/adr/NNNN-<slug>.md    # decisions, created lazily
docs/CODING_STANDARDS.md   # only when the repo documents no standards elsewhere
```

- `<feature>` is a kebab-case slug the user confirmed. `NN` is two digits, numbered in dependency order (blockers first).
- `docs/.specs` is a hidden directory, which ripgrep skips by default. Open these files by exact path, list them with `ls docs/.specs/<feature>/tickets`, or pass `--hidden` to ripgrep.

## Spec frontmatter

```yaml
---
feature: <feature>
status: draft          # draft | approved; set to approved by /alper:spec
tickets: none          # none | draft | approved; set by /alper:spec
base: ""               # the branch /alper:build started from; set by /alper:build
---
```

## Ticket file

```markdown
---
id: "03"
title: <short title>
status: todo
blocked-by: ["01", "02"]
branch: ticket/<feature>/03-<slug>
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

## Ticket status

| Status | Set by | When |
|---|---|---|
| `todo` | architect | the ticket is written |
| `in-progress` | `/alper:build` | a developer is dispatched |
| `done` | merger | inside the ticket's merge commit |
| `blocked` | merger or `/alper:build` | the ticket cannot get green; a `## Blocked` section appended to the ticket says why |

Only `/alper:build` and the merger write ticket files after the architect; developers read them.

The **frontier** is every ticket with `status: todo` whose every `blocked-by` id is `done`.

## Branches and commits

| Thing | Name |
|---|---|
| Feature branch | `feat/<feature>`, created from `base` |
| Ticket branch | the ticket's `branch` field, created from `feat/<feature>` |
| Review-fix branch | `fix/<feature>/review-<cycle>`, created from `feat/<feature>` |
| Developer commit | one per ticket or review cycle; trailer `Ticket: <feature>/NN`, or `Review-fix: <feature>/<cycle>` |
| Merge commit | the merged commit's title and trailer; always `--no-ff` |

Titles and bodies follow the `commit` skill. Read a trailer with `git log --format='%(trailers:key=Ticket,valueonly)'`.
