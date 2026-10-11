---
id: "07"
title: The build works milestone by milestone, each reviewed before it lands
status: done
blocked-by: ["01", "05", "06"]
branch: ticket/milestone-builds/07-build-milestone-flow
milestone: "01"
touches: ["build", "readme"]
---

## What it delivers

`/alper:build` restructured around milestones: for each milestone not yet landed, in order, it cuts a milestone branch from `feat/<feature>`, builds the milestone's frontier, merges each ticket into the milestone branch through the merger, reviews the milestone with its scope, saves the report, runs at most two fix cycles, and lands the milestone on `feat/<feature>` through the merger's milestone merge. A spec without `## Milestones` builds as one implicit milestone. A stopped build resumes from trailers, ticket statuses and the saved report. This is the tracer bullet the other build tickets extend.

## Acceptance criteria

- [ ] The Process is laid out as the spec's sections: preconditions; first run (record `base`, create `feat/<feature>`); the main checkout rule; the milestone flow as numbered steps 1–8 (cut or resume, schedule, questions, stuck, merge, review, land, pause); resume of a reviewed milestone; final check; report; stop conditions. Steps this ticket does not fill keep today's behaviour (schedule: dispatch the milestone's whole frontier at once; questions: ask the user and resume; stuck: none; pause: none).
- [ ] A spec with no `## Milestones` section builds as milestone `01` with slug `<feature>`, on `milestone/<feature>/m01-<feature>`, through the same flow.
- [ ] Each milestone branch is cut from `feat/<feature>` only after the previous milestone landed (its `Milestone:` merge is on `feat/<feature>`); landed milestones are skipped.
- [ ] Developers and the merger are dispatched with the milestone branch as integration branch; the main checkout is on the milestone branch while tickets and fixes merge, and on `feat/<feature>` for the milestone merge.
- [ ] When every ticket of the milestone is `done`, `review` runs with the milestone scope; the combined report is written to `reviews/m<NN>-<slug>.md` and committed on the milestone branch, replacing any earlier one in a new commit.
- [ ] Fix verdict with fewer than 2 fix cycles used (counted from `Review-fix:` trailers) → one developer on `fix/<feature>/m<NN>-review-<cycle>`, merged by the merger, then review again; with 2 used → stop and report the remaining findings.
- [ ] Clean verdict → the merger's milestone merge lands the milestone on `feat/<feature>`.
- [ ] Resume: an existing milestone branch is switched to and its `in-progress` tickets resumed (one commit on top → merger; otherwise clean up and reset to `todo`); a milestone whose tickets are all `done` acts on the saved report's verdict when the branch tip is that report's commit, otherwise reviews again.
- [ ] The report follows the spec's shape (`feature`, `milestones` per milestone with state, tickets and fix cycles, `smells`, `next`); the `final check` line is ticket 10's.
- [ ] Stop conditions add findings left after two fix cycles; Rationalizations, Red Flags and Verification say one review per milestone, `feat/<feature>` receives only milestone merges.
- [ ] The README opening line says one review per milestone instead of one per feature.
- [ ] `node skills/writing-for-agents/scripts/lint-skill.js .` and `claude plugin validate .` pass, and `skills/build/SKILL.md` stays under the linter's 500-line limit.

## Test seams

Behaviour seam, checked at release: scenario 1 (2 milestones, one review report per milestone, `git log --first-parent feat/<feature>` holds only `Milestone:` merges), scenario 3 (implicit milestone branch), scenario 4 (kill and re-run: no ticket, milestone or `Review-fix:` commit created twice), scenario 5 (gap fixed on `fix/<feature>/m01-review-1`, two commits of the report). Structure seam: `lint-skill.js`.

## Notes

- Blocked by 01 (formats: branches, trailers, Landed, implicit milestone, reviews layout), 05 (developer and merger take the integration branch; the milestone merge), 06 (review's milestone scope).
- Spec sections: User Stories 6–12, 31; Implementation Decisions › `build` (state diagram, main checkout, milestone flow, resume), README; ADR 0001.
- Orchestrate, never restate: name `review`, `implement-ticket` and `merge-ticket`, link formats to the Artifacts reference.
- Six tickets (08, 09, 10, 13, 15, 17) edit this skill in parallel right after it lands, each inside its own step. Give every step its own heading and keep Stop conditions, Red Flags and Verification as one-item-per-line lists so their additions merge cleanly.
- Keep the bare `NN` single-ticket route working on the ticket's milestone branch with no review; ticket 16 replaces it with `tNN`.
- Checks: no typecheck or test suite; ticket tests and full suite are the two commands above.
