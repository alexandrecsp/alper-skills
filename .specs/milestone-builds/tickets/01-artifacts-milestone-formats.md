---
id: "01"
title: Artifacts reference defines every milestone format
status: done
blocked-by: []
branch: ticket/milestone-builds/01-artifacts-milestone-formats
milestone: "01"
touches: ["artifacts"]
---

## What it delivers

The Artifacts reference becomes the single source of truth for every new format a milestone build reads or writes, so each later ticket links to one definition instead of restating it. This is the prefactoring ticket: it adds the contracts; the skills that follow them come in later tickets.

## Acceptance criteria

- [ ] The Layout lists `.specs/<feature>/reviews/m<NN>-<slug>.md` as the latest review report of a milestone.
- [ ] A Spec section defines the `## Milestones` contract (`### M<NN> <slug>`, `- User stories:`, `- Success criteria:`), placed between User Stories and Implementation Decisions, with `NN` two digits from 01 in landing order, every user story in exactly one milestone, and a Success Criterion under no milestone checked only by the Final Spec-only check.
- [ ] The ticket template's frontmatter carries `milestone: "NN"` and `touches: [...]` (module names as the spec names them), and the reference states that two tickets touch the same module when their `touches` lists share an entry.
- [ ] The Ticket status table says `in-progress` is set only on a dispatched ticket, and `blocked` is set by the merger (a merge it cannot get green) or by `/alper:build` (a ticket still Stuck after its Opus retry).
- [ ] The reference defines Landed (a merge commit on `feat/<feature>` with trailer `Milestone: <feature>/<NN>`, the only test), the implicit milestone (`01`, slug `<feature>`, tickets need no `milestone` field, any other milestone named is undeclared), and the Frontier as scoped to the current milestone.
- [ ] The Branches and commits table matches the spec's table row for row: feature branch receives only milestone merges; milestone branch `milestone/<feature>/m<NN>-<slug>`; ticket branch cut from its milestone branch; review-fix branch `fix/<feature>/m<NN>-review-<cycle>`; trailers `Ticket: <feature>/NN`, `Review-fix: <feature>/m<NN>-<cycle>`, `Milestone: <feature>/<NN>`; every merge `--no-ff`.
- [ ] The reference defines the Integration branch (a ticket's or review fix's milestone branch, passed to developers and the merger as a parameter), fix cycles used (counted from `Review-fix: <feature>/m<NN>-<cycle>` trailers on the milestone branch), and the Follow-up decision entry (`Build · t<NN> (<date>):` under `## Follow-up decisions` in `brainstorm.md`, listing each question and answer).
- [ ] `node skills/writing-for-agents/scripts/lint-skill.js .` and `claude plugin validate .` pass.

## Test seams

Structure seam (`lint-skill.js`, which checks every link into the reference) and plugin seam (`claude plugin validate .`). Behaviour is observed through the skills that follow these formats, in later tickets.

## Notes

- Spec sections: Implementation Decisions › Artifacts reference; the gitGraph above it.
- Use `GLOSSARY.md` terms: Milestone, Landed, Milestone branch, Integration branch, Frontier, Fix cycle, Follow-up decision, Final Spec-only check. Never "fix round" or "wave" for a milestone.
- Keep formats only; no process steps. The skills that use them link here.
- Checks in this repo: no typecheck and no test suite. "Ticket tests" and "full suite" are both `node skills/writing-for-agents/scripts/lint-skill.js .` plus `claude plugin validate .`; prove each criterion by the text it adds.
- Wave 2 tickets (03, 04, 05) link to these definitions; name anchors plainly so links are stable.
