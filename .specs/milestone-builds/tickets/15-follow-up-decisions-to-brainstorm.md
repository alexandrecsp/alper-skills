---
id: "15"
title: Answers to developer questions are kept in the brainstorm
status: done
blocked-by: ["07"]
branch: ticket/milestone-builds/15-follow-up-decisions-to-brainstorm
milestone: "02"
touches: ["build"]
---

## What it delivers

When a developer returns questions, the build puts them to the user, appends the answers to `brainstorm.md` as a Follow-up decision, commits it on the milestone branch, and resumes the developer with the answers. The approved spec is never edited.

## Acceptance criteria

- [ ] Milestone-flow step 3 appends a `Build · t<NN> (<date>):` entry listing each question and answer under `## Follow-up decisions` in `brainstorm.md`, linking the Artifacts reference format.
- [ ] The entry is committed on the current milestone branch before the developer is resumed with the answers.
- [ ] Step 3 states `spec.md` is not edited during a build; a Red Flag names an edited `spec.md`.
- [ ] `node skills/writing-for-agents/scripts/lint-skill.js .` and `claude plugin validate .` pass.

## Test seams

Behaviour seam, scenario 9 (a `Build · t<NN>` entry in `brainstorm.md`, committed on the milestone branch, `spec.md` unchanged). Checked at release. Structure seam: `lint-skill.js`.

## Notes

- Blocked by 07: edits milestone-flow step 3 and commits on the milestone branch 07 introduces.
- Spec sections: User Story 30; Implementation Decisions › `build` › Milestone flow step 3, Artifacts reference › Follow-up decisions; Out of Scope (editing the approved spec during a build).
- Other tickets edit this skill in parallel; stay inside step 3.
- Checks: no typecheck or test suite; ticket tests and full suite are the two commands above.
