---
id: "14"
title: A stuck developer gets one retry on Opus before the build stops
status: done
blocked-by: ["07", "08"]
branch: ticket/milestone-builds/14-stuck-retry-on-opus
milestone: "02"
touches: ["build", "implement-ticket"]
---

## What it delivers

A developer that cannot get green hands back Stuck with the failing check; the build retries the ticket once from scratch on Opus with the stuck report in the prompt, keeping its slot, and marks it `blocked` only if the retry is Stuck too. A stuck review-fix developer gets the same single retry, then the build stops with the remaining findings. A merge the merger cannot get green goes straight to the user with no retry.

## Acceptance criteria

- [ ] `implement-ticket` gains a third hand-back, `stuck`, returned when typecheck, the ticket's tests or the full suite cannot be made green, carrying the failing check and its output instead of a commit; the green and questions hand-backs are unchanged.
- [ ] `implement-ticket`, dispatched as a retry, reads the stuck report in its prompt before the first test.
- [ ] Milestone-flow step 4: a Stuck hand-back → the build removes the worktree and branch, and dispatches a fresh developer for the same ticket with the model overridden to Opus and the stuck report in its prompt; the retry keeps the ticket's slot.
- [ ] Stuck again → the ticket is set `blocked` with a `## Blocked` section naming the failing check, committed on the milestone branch; running developers finish and merge; the build stops and reports.
- [ ] A Stuck review-fix developer gets one Opus retry; Stuck again → the build stops and reports the remaining findings.
- [ ] Milestone-flow step 5 states a `blocked` merger report is never retried: running developers finish and merge, then the build stops and reports.
- [ ] Stop conditions add a ticket or fix still Stuck after its Opus retry; a Red Flag names a second Opus retry.
- [ ] `node skills/writing-for-agents/scripts/lint-skill.js .` and `claude plugin validate .` pass.

## Test seams

Behaviour seam, scenario 8 (a ticket planted to be unsolvable: the trace shows exactly one Opus dispatch for it, then the ticket `blocked` and the build stopped). Checked at release. Structure seam: `lint-skill.js`.

## Notes

- Blocked by 07 (milestone-flow steps 4–6 and the milestone branch the retry is cut from) and 08 (the slot the retry keeps).
- Spec sections: User Stories 27, 28, 29; Implementation Decisions › `build` › Milestone flow steps 4–6, `implement-ticket` (fourth and fifth bullets), `developer` agent (the Opus retry is a per-dispatch override; the agent's default stays `sonnet`).
- Glossary: Stuck is the hand-back, Blocked the status; never "failed".
- Ticket 12 edits `implement-ticket`'s branch-cut step and the build's dispatch line in parallel; stay inside the hand-back and steps 4–6.
- Checks: no typecheck or test suite; ticket tests and full suite are the two commands above.
