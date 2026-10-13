---
id: "11"
title: The scheduler avoids running two tickets that touch the same module
status: done
blocked-by: ["08"]
branch: ticket/milestone-builds/11-build-touches-aware-scheduling
milestone: "02"
touches: ["build"]
---

## What it delivers

When a slot frees, the scheduler takes the highest-ranked frontier ticket that touches no module a running ticket touches; when every frontier ticket overlaps, it takes the first one anyway so the slot never idles.

## Acceptance criteria

- [ ] Step 2 picks, in rank order, the first frontier ticket whose `touches` shares no entry with any running ticket's `touches`.
- [ ] When every frontier ticket overlaps a running ticket, the first in rank order starts anyway.
- [ ] The same-module rule links the Artifacts reference definition instead of restating it.
- [ ] A Red Flag names two tickets sharing a module running together while a non-overlapping ticket was ready.
- [ ] `node skills/writing-for-agents/scripts/lint-skill.js .` and `claude plugin validate .` pass.

## Test seams

Behaviour seam, scenario 2 (two ready tickets sharing a `touches` entry plus a third, cap 2: the pair is never `in-progress` together). Checked at release. Structure seam: `lint-skill.js`.

## Notes

- Blocked by 08: extends its slot scheduler and ranking.
- Spec sections: User Story 17; Implementation Decisions › `build` › Milestone flow step 2; Artifacts reference › ticket frontmatter.
- Other tickets edit this skill in parallel; stay inside step 2.
- Checks: no typecheck or test suite; ticket tests and full suite are the two commands above.
