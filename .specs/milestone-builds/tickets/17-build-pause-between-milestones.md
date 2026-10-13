---
id: "17"
title: The build pauses between milestones when the setting or a flag says so
status: done
blocked-by: ["02", "07"]
branch: ticket/milestone-builds/17-build-pause-between-milestones
milestone: "02"
touches: ["build", "readme"]
---

## What it delivers

After a milestone lands and more target milestones remain, the build pauses when `Pause between milestones` is `on`, overridden for one run by `--pause` or `--no-pause`: it reports the landed milestone and ends the turn; the next `/alper:build` resumes.

## Acceptance criteria

- [ ] The argument hint and the README `/alper:build` row gain `[--pause|--no-pause]`.
- [ ] Milestone-flow step 8 reads `Pause between milestones`; `--pause` or `--no-pause` overrides it for this run only.
- [ ] Pausing on, with target milestones remaining → the build reports the landed milestone with `next: /alper:build <feature>` and ends the turn.
- [ ] Pausing off, or no target milestones remaining → the build continues to the next milestone or the final report.
- [ ] A re-run after a pause resumes at the next milestone not yet landed.
- [ ] `node skills/writing-for-agents/scripts/lint-skill.js .` and `claude plugin validate .` pass.

## Test seams

Behaviour seam, scenario 10 (`Pause between milestones: on` ends the run after M01 lands; `--no-pause` runs through; a re-run resumes M02). Checked at release. Structure seam: `lint-skill.js`.

## Notes

- Blocked by 02 (the `Pause between milestones` setting) and 07 (milestone-flow step 8 and resume from `Milestone:` trailers).
- Spec sections: User Story 25; Implementation Decisions › `build` (argument hint, Milestone flow step 8, state diagram `Landed → Paused`), README.
- Ticket 16 edits the same argument-hint line and README row to add `[mNN] [tNN]`; whichever merges second keeps both.
- Other tickets edit this skill in parallel; stay inside step 8 and the argument hint.
- Checks: no typecheck or test suite; ticket tests and full suite are the two commands above.
