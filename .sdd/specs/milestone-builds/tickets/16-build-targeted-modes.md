---
id: "16"
title: Targeted builds of one milestone (mNN) or one ticket (tNN)
status: done
blocked-by: ["07", "09", "10"]
branch: ticket/milestone-builds/16-build-targeted-modes
milestone: "02"
touches: ["build", "readme"]
---

## What it delivers

`/alper:build [feature] mNN` runs the full milestone flow for milestone NN only; `tNN` merges one ticket into its milestone branch with no review; `mNN tNN` acts as `tNN` guarded by the milestone. Unmet prerequisites refuse with the command that lands them; an already-landed target, or a plain run on a fully landed feature, reports and changes nothing. The bare `NN` argument is gone.

## Acceptance criteria

- [ ] The argument hint and the README `/alper:build` row read `[feature] [mNN] [tNN]` (ticket 17 adds the pause flags); When to Use routes plain, `mNN`, `tNN` and `mNN tNN`, and the bare `NN` route is removed.
- [ ] Precondition 4: in `mNN tNN` mode, a ticket whose `milestone` is not NN refuses the run before anything is written.
- [ ] The targets-and-prerequisites table matches the spec: plain → every milestone not yet landed; `mNN` → milestone NN, needing every earlier milestone landed; `tNN` → ticket NN, needing every earlier milestone landed and every `blocked-by` ticket `done`.
- [ ] An unmet prerequisite refuses the run, naming what must land first and the command that lands it (`/alper:build <feature> mNN` or `/alper:build <feature> tNN`).
- [ ] Already landed: `mNN` on a landed milestone, `tNN` on a `done` ticket, and a plain run with every milestone landed each report it and stop, changing nothing.
- [ ] `mNN` runs the milestone flow once, then stops; when it lands the last milestone, the final Spec-only check runs.
- [ ] `tNN` cuts or switches to the ticket's milestone branch and runs milestone-flow steps 2–5 for that ticket only: no review, no milestone merge.
- [ ] The preconditions, including the missing-setting stop, apply to every mode.
- [ ] `node skills/writing-for-agents/scripts/lint-skill.js .` and `claude plugin validate .` pass, and the linter accepts the new `argument-hint`.

## Test seams

Behaviour seam, scenario 7 (`t<NN>` with an undone blocker refuses and names the command; `t<NN>` on a ready ticket merges into its milestone branch with no review; `m<NN> t<NN>` with a mismatched milestone refuses; `m02` before M01 landed refuses; `m01` after it landed reports and changes nothing). Checked at release. Structure seam: `lint-skill.js`.

## Notes

- Blocked by 07 (milestone flow and its steps 2–5), 09 (the preconditions list precondition 4 joins, and their every-mode rule), 10 (the final Spec-only check `mNN` must trigger when it lands the last milestone).
- Spec sections: User Stories 32–36; Implementation Decisions › `build` (argument hint, Preconditions 4, Targets and prerequisites, Ticket mode, Final Spec-only check), README.
- Ticket 17 edits the same argument-hint line and README row to add `[--pause|--no-pause]`; whichever merges second keeps both.
- Checks: no typecheck or test suite; ticket tests and full suite are the two commands above.
