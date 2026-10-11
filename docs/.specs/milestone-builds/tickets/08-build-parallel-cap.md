---
id: "08"
title: The build schedules tickets under the parallel cap, critical path first
status: done
blocked-by: ["02", "07"]
branch: ticket/milestone-builds/08-build-parallel-cap
milestone: "01"
touches: ["build"]
---

## What it delivers

Milestone-flow step 2 replaces "dispatch the whole frontier" with a slot scheduler: never more dispatched-but-unmerged tickets than `Parallel cap`, one new ticket started each time a slot frees, ranked by the longest dependency chain it heads within the current milestone, then lowest number. Only dispatched tickets become `in-progress`.

## Acceptance criteria

- [ ] Step 2 reads `Parallel cap` from the `## Agent workflow` block.
- [ ] A slot is free while fewer dispatched-but-unmerged tickets exist than the cap; a ticket waiting for the merger still holds its slot.
- [ ] Each time a slot frees, exactly one ticket starts: the frontier is ranked by the length of the longest dependency chain each ticket heads within the current milestone, then by lowest number, and the first is taken.
- [ ] Each started ticket is set `in-progress` in its own commit `build: start NN` on the milestone branch, then its developer is dispatched in the background; every other ticket stays `todo`.
- [ ] The Red Flags and Verification name more dispatched-but-unmerged tickets than the cap, and an `in-progress` ticket with no developer.
- [ ] `node skills/writing-for-agents/scripts/lint-skill.js .` and `claude plugin validate .` pass.

## Test seams

Behaviour seam, scenario 1: with `Parallel cap: 2` and an M01 frontier of 3, the ticket files' frontmatter in each commit never shows more than 2 dispatched-but-unmerged tickets. Checked at release. Structure seam: `lint-skill.js`.

## Notes

- Blocked by 02 (the `Parallel cap` setting's name and place in the block) and 07 (milestone-flow step 2, which this replaces).
- Spec sections: User Stories 15, 16, 18; Implementation Decisions › `build` › Milestone flow step 2.
- Touch avoidance is ticket 11; leave a clear point in the ranking where "first that touches no running ticket's module" will go.
- The missing-setting stop is ticket 09; do not add it here.
- Other tickets edit this skill in parallel; stay inside step 2 and append single lines to shared lists.
- Checks: no typecheck or test suite; ticket tests and full suite are the two commands above.
