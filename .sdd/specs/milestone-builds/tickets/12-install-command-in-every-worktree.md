---
id: "12"
title: Setup derives the install command and every developer runs it
status: done
blocked-by: ["02", "05", "08"]
branch: ticket/milestone-builds/12-install-command-in-every-worktree
milestone: "02"
touches: ["setup-repository", "build", "implement-ticket"]
---

## What it delivers

Setup works out the install command from the lockfile or manifest and asks the user to confirm it; the build passes the command in every developer dispatch; each developer runs it right after cutting its branch, unless it is `none`.

## Acceptance criteria

- [ ] `setup-repository` Explore finds the lockfile or manifest and derives the install command from it, or `none` when the repo needs no install.
- [ ] The Install command question offers the derived command as the recommended answer, to confirm or correct.
- [ ] The build's developer dispatch (milestone-flow step 2, and the fix-cycle dispatch) carries the `Install command` from the block.
- [ ] `implement-ticket` runs the install command right after cutting its branch, before loading the ticket, and skips it when the command is `none`; its Done when and Verification cover it.
- [ ] `node skills/writing-for-agents/scripts/lint-skill.js .` and `claude plugin validate .` pass.

## Test seams

Behaviour seam, scenario 11 (setup proposes the derived command; every developer's trace shows the install command after the branch cut). Checked at release. Structure seam: `lint-skill.js`.

## Notes

- Blocked by 02 (the Install command question and bullet), 05 (`implement-ticket`'s rewritten branch-cut step), 08 (the dispatch line in the scheduler).
- Spec sections: User Stories 21, 24; Implementation Decisions › `setup-repository` (first bullet), `build` › Milestone flow step 2, `implement-ticket` (second bullet).
- Ticket 14 edits `implement-ticket`'s hand-back and the build's stuck step in parallel; stay inside the branch-cut step and the dispatch line.
- Checks: no typecheck or test suite; ticket tests and full suite are the two commands above.
