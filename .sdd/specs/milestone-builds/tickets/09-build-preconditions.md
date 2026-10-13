---
id: "09"
title: The build refuses a missing setting or a broken breakdown before writing anything
status: done
blocked-by: ["02", "07"]
branch: ticket/milestone-builds/09-build-preconditions
milestone: "01"
touches: ["build"]
---

## What it delivers

The build's preconditions grow two checks that run before anything is written, in every mode: all four build settings are in the `## Agent workflow` block, and the breakdown is valid. Either failing stops the build, naming the cause.

## Acceptance criteria

- [ ] A missing `Parallel cap`, `Parallel test suites`, `Pause between milestones` or `Install command` bullet stops the build and asks the user to re-run `/alper:setup-repository`, naming the missing settings.
- [ ] When the spec declares milestones, a ticket with no `milestone`, or with a `milestone` the spec does not declare, stops the build and names the ticket.
- [ ] A ticket whose `blocked-by` names a ticket in a later milestone stops the build and names both tickets.
- [ ] With the implicit milestone, a ticket naming any milestone but `01` is an undeclared milestone.
- [ ] The preconditions state they apply to every mode and run before the first-run `base` commit, so a refused build leaves `git status --porcelain` empty and creates no branch.
- [ ] Stop conditions add a missing setting and an invalid breakdown; Verification checks the preconditions ran first.
- [ ] `node skills/writing-for-agents/scripts/lint-skill.js .` and `claude plugin validate .` pass.

## Test seams

Behaviour seam, scenario 6 (a ticket depending on a later milestone, a ticket with no `milestone`, a missing setting: each stops before writing anything, naming the cause, `git status --porcelain` empty). Checked at release. Structure seam: `lint-skill.js`.

## Notes

- Blocked by 02 (the four setting names) and 07 (the preconditions section of the restructured build).
- Spec sections: User Stories 5, 23; Implementation Decisions › `build` › Preconditions 2 and 3.
- Precondition 4 (`mNN tNN` guard) is ticket 16; the red-base check is ticket 13.
- Other tickets edit this skill in parallel; stay inside the preconditions and append single lines to shared lists.
- Checks: no typecheck or test suite; ticket tests and full suite are the two commands above.
