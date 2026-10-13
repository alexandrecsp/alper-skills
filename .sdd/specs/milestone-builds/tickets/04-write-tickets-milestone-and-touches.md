---
id: "04"
title: Tickets name their milestone and touches; blockers stay in earlier milestones
status: done
blocked-by: ["01"]
branch: ticket/milestone-builds/04-write-tickets-milestone-and-touches
milestone: "01"
touches: ["write-tickets", "spec"]
---

## What it delivers

`write-tickets` gives every ticket a `milestone` and a `touches` list, refuses a breakdown where a ticket is blocked by a later milestone's ticket, and returns the breakdown with `Milestone` and `Touches` columns and waves per milestone; `/alper:spec` shows that breakdown unchanged.

## Acceptance criteria

- [ ] Step 5 of `write-tickets` requires `milestone` and `touches` on every ticket, with `touches` naming modules as the spec names them, per the Artifacts reference ticket template.
- [ ] A check before writing states that every `blocked-by` id is in the ticket's own milestone or an earlier one, and that the architect re-slices until it holds; Done when and Verification include it.
- [ ] Step 6's table has the columns `NN | Title | Milestone | Blocked by | Touches | What it delivers`, and the frontier waves are listed per milestone.
- [ ] A Red Flag names a blocker in a later milestone and a ticket without `milestone` or `touches`.
- [ ] `/alper:spec` step 6 shows the table with its `Milestone` and `Touches` columns and the waves per milestone; no other step of `/alper:spec` changes.
- [ ] `node skills/writing-for-agents/scripts/lint-skill.js .` and `claude plugin validate .` pass.

## Test seams

Structure seam (`lint-skill.js`). Behaviour: the next `/alper:spec` run shows the new columns and per-milestone waves, checked at release.

## Notes

- Blocked by 01: uses the `milestone` and `touches` frontmatter fields 01 adds to the ticket template.
- Spec sections: User Stories 3, 4; Implementation Decisions › `write-tickets`, `spec`.
- The build-side refusal of a broken breakdown is ticket 09.
- Checks: no typecheck or test suite; ticket tests and full suite are the two commands above.
