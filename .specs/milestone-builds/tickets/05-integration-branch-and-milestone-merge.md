---
id: "05"
title: Developer and merger work on an integration branch; the merger lands milestones
status: done
blocked-by: ["01"]
branch: ticket/milestone-builds/05-integration-branch-and-milestone-merge
milestone: "01"
touches: ["implement-ticket", "merge-ticket", "merger", "readme"]
---

## What it delivers

The developer and the merger take the integration branch as a parameter instead of assuming `feat/<feature>`, review-fix work uses the milestone-scoped names, and the merger gains a milestone merge that lands a milestone branch on `feat/<feature>`. This is the seam the milestone flow in ticket 07 dispatches through.

## Acceptance criteria

- [ ] `implement-ticket` cuts its branch from the integration branch it was dispatched with; every `feat/<feature>` reference in its steps, checks, squash (`git reset --soft`), rationalizations, red flags and verification becomes the integration branch.
- [ ] `implement-ticket`'s review-fix path uses branch `fix/<feature>/m<NN>-review-<cycle>` and trailer `Review-fix: <feature>/m<NN>-<cycle>`, by link to the Artifacts reference.
- [ ] `merge-ticket` takes the integration branch as a parameter: step 1 checks the main checkout is on it, the merge goes into it, and step 3 looks up the conflicting ticket's trailer on it.
- [ ] `merge-ticket` has a milestone-merge path: dispatched with a milestone branch and `feat/<feature>` as integration branch, it merges `--no-ff` with title `M<NN> <slug>` and trailer `Milestone: <feature>/<NN>`, reruns typecheck and the full suite, skips the ticket-file updates, and after a green commit deletes the milestone branch with `git branch -d`.
- [ ] `merge-ticket`'s description, When to Use and Verification cover the integration branch and the milestone merge.
- [ ] The `merger` agent's description and body name the integration branch from its prompt instead of `feat/<feature>`; the README Agents row for `merger` says the same.
- [ ] `node skills/writing-for-agents/scripts/lint-skill.js .` and `claude plugin validate .` pass.

## Test seams

Plugin seam (`claude plugin validate .`, for the agent definition) and structure seam (`lint-skill.js`). Behaviour scenario 1 (`feat/<feature>` holds only the two `Milestone:` merges) and scenario 5 (the `fix/<feature>/m01-review-1` branch) observe it end to end once ticket 07 lands, checked at release.

## Notes

- Blocked by 01: uses the branch names, trailers and Integration branch definition 01 adds.
- Spec sections: User Stories 8, 9; Implementation Decisions › `implement-ticket` (first and third bullets), `merge-ticket` and the `merger` agent; ADR 0001.
- Install command (ticket 12) and the stuck hand-back (ticket 14) also edit `implement-ticket` later; keep step 1 and step 6 easy to extend.
- The `developer` agent stays unchanged.
- Checks: no typecheck or test suite; ticket tests and full suite are the two commands above.
