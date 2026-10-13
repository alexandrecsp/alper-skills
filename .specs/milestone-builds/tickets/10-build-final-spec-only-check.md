---
id: "10"
title: A final Spec-only check reports on the whole feature after the last milestone lands
status: done
blocked-by: ["06", "07"]
branch: ticket/milestone-builds/10-build-final-spec-only-check
milestone: "01"
touches: ["build"]
---

## What it delivers

In the run that lands the last milestone, the build applies `review` Spec-only on `feat/<feature>` against `base`, over every ticket and the whole spec, and puts its findings in the final report with no fix cycle. It is skipped when the spec declares no milestones.

## Acceptance criteria

- [ ] After the last milestone lands, `review` runs with the Spec-only input on `feat/<feature>` against `base`, over every ticket and the whole spec.
- [ ] Its findings go only into the report's `final check` line; no fix cycle starts and nothing is committed for it.
- [ ] With no `## Milestones` section in the spec, the check is skipped and the report says `final check: skipped (no declared milestones)`.
- [ ] While milestones remain, the report says `final check: not yet (milestones remain)`; with no findings, `none`.
- [ ] A Red Flag names a fix cycle started for the final check's findings.
- [ ] `node skills/writing-for-agents/scripts/lint-skill.js .` and `claude plugin validate .` pass.

## Test seams

Behaviour seam, checked at release: scenario 1 (the final Spec-only check appears in the report) and scenario 3 (`final check: skipped`). Structure seam: `lint-skill.js`.

## Notes

- Blocked by 06 (review's Spec-only input) and 07 (the milestone loop and report it hangs off).
- Spec sections: User Stories 13, 14; Implementation Decisions › `build` › Final Spec-only check, Report; Out of Scope (a fix cycle for the final check).
- Ticket 16 relies on this running in "whichever run lands the last milestone", including `mNN`; word it that way, not as "the end of a plain run".
- Other tickets edit this skill in parallel; stay inside the final-check section and the report's `final check` line.
- Checks: no typecheck or test suite; ticket tests and full suite are the two commands above.
