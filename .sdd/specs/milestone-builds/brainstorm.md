# Brainstorm: milestone-builds

Confirmed 2026-10-11.

**What**
- Outcome:      `/alper:build` works milestone by milestone, `feat/<feature>` only receives reviewed milestones, and parallel developers are capped
- Who:          you, the developer running alper on a feature, and anyone reading the feature branch's history
- Success:      an end-to-end run on a sample repo shows 2 milestones, a cap below the frontier being respected, one review per milestone, and `feat` receiving only milestone merges; `lint-skill.js` and `claude plugin validate .` pass
- Constraint:   alper stays a Claude Code plugin of markdown skills and agents; the structure contract and linter apply to every changed skill
- Decisions:    the architect declares milestones (groups of tickets delivering specific user stories you can demo); computed waves are not milestones
                tickets merge one at a time into a milestone branch; the milestone branch merges into `feat` only after its review is Clean
                pausing for you between milestones is a setting, off by default
                a spec with no milestones counts as one milestone, so today's behaviour is unchanged
                setup asks for the parallel cap
                in scope: answers to developer questions written back to `brainstorm.md`, and a check that the base branch is green before the build
                in scope: setup records the per-worktree install command, a stuck ticket gets one retry on Opus, and scheduling avoids running two tickets that touch the same module at once
- Out of scope: review per ticket; merging tickets only at the end of a milestone; GitHub/GitLab/Linear sync; agent tools other than Claude Code; opening the PR
- Parked:       none

**How**
- Decisions:    settings (parallel cap, whether test suites can run at the same time, pause setting, install command) are new lines in the `## Agent workflow` block, which setup writes and updates in place
                default cap is 3, or 1 when test suites can't run at the same time
                the cap counts every dispatched ticket not yet merged, including ones waiting for the merger; new tickets start one at a time as slots free up, not in batches
                when more tickets are ready than the cap allows, the ticket at the head of the longest dependency chain goes first, then the lowest ticket number
                the architect lists the modules each ticket `touches`; the build avoids running two tickets that touch the same module, but fills a free slot anyway when nothing else is ready
                only dispatched tickets are marked `in-progress`; the rest stay `todo`
                milestones are declared in a `## Milestones` section of the spec (`M<NN> <slug>`, its user stories and success criteria), plus `milestone: "NN"` in each ticket's frontmatter
                a ticket may depend only on tickets in its own milestone or an earlier one; the architect checks this, and the build refuses to start if it's broken
                milestone branch `milestone/<feature>/m<NN>-<slug>`, cut from `feat` after the previous milestone lands; tickets are cut from it and merged into it one at a time with `--no-ff`; the milestone merges into `feat` with `--no-ff` and a `Milestone: <feature>/<NN>` trailer
                review runs on both axes, on the milestone branch compared with `feat`, scoped to that milestone's tickets and user stories; the report is saved to `.sdd/specs/<feature>/reviews/m<NN>-<slug>.md` and committed on the milestone branch; up to 2 fix rounds per milestone, then the build stops and reports
                after the last milestone, a Spec-only check runs across the whole feature and reports findings without starting a fix round
                pause is off by default; `--pause` or `--no-pause` overrides it for one run; you resume by running `/alper:build` again
                resume: a milestone counts as finished once `feat` has its merge with the `Milestone:` trailer; ticket statuses and the saved review reports cover the milestone in progress
                `/alper:build [feature] NN` merges into that ticket's milestone branch, creating it if needed, with no review
                a developer that can't get its ticket green is retried once on Opus, with the model overridden for that dispatch, before the ticket is marked blocked; a blocked merge goes straight to you
                developer answers are appended to `brainstorm.md` under `## Follow-up decisions`, committed on `feat`, and passed to the developer; the approved spec is not edited
                the build runs the full suite on the base first and stops, reporting the failures, if it's red
                setup works out the install command from the lockfile or manifest and asks you to confirm it; each developer runs it right after cutting its branch
- Parked:       none

## Follow-up decisions

Spec · round 1 (2026-10-11):

- Q1 Where follow-up decisions are committed: **A**. On the current milestone branch; they reach `feat` when the milestone merges.
- Q2 A spec with no `## Milestones` section: **A**. An implicit M01 `milestone/<feature>/m01-<feature>` runs the full milestone flow; the final Spec-only check is skipped.
- Q3 New specs always declare milestones: **A**. Every new spec has a `## Milestones` section, even with one milestone.
- Q4 Single-ticket mode: answered with a new command shape, `/alper:build [feature] mNN tNN`, where `mNN` (a milestone) and `tNN` (a ticket) are both optional. This replaces the bare `NN` argument. Not yet settled: what `mNN` alone does, what `mNN tNN` together means, and what happens when the target's blockers or earlier milestones haven't landed (round 1 recommended refusing and naming what must land first).
- Q5 When the base-is-green check runs: **A**. Only on the first run, on `base`, before `feat/<feature>` is created, including a first run in a targeted mode.
- Q6 Workflow block with no build settings: **B**. `/alper:build` stops and asks the user to re-run `/alper:setup-repository` first.
- Q7 Term: **A**. **Fix cycle** in `GLOSSARY.md`, with "fix round" listed as `_Avoid_`.
- Q8 Where the Opus retry starts: **A**. From scratch: remove the stuck worktree and branch, cut a new branch from the milestone branch, and include the stuck developer's report in the prompt.
- Q9 Stuck review-fix developers: **A**. One retry on Opus, then the build stops and reports the remaining findings.

The user raised no objection to the architect's self-settled decisions: the merger merges milestones into `feat`; fix branches are `fix/<feature>/m<NN>-review-<cycle>` with trailer `Review-fix: <feature>/m<NN>-<cycle>`; developers and the merger take the integration branch as a parameter; a setup re-run asks only for settings missing from the block; used fix cycles are counted from `Review-fix:` trailers; the final Spec-only check's findings go in the final report only.

Spec · round 2 (2026-10-11):

- Q1 Target's prerequisites have not landed: **A**. Refuse to start and name what must land first, with the command that lands it.
- Q2 Target already landed: **A**. Report that it has already landed and stop, changing nothing.
- Q3 `mNN` alone: **A**. Run the full milestone flow for milestone NN only (cut its branch, build its tickets under the cap, review with up to 2 fix cycles, merge into `feat`), then stop.
- Q4 `mNN tNN` together: **A**. The same as `tNN` alone; `mNN` is only a guard, and the build refuses when the ticket's `milestone` is not NN.
- `tNN` alone (architect-settled, no objection): replaces the bare `NN`; merges the ticket into its milestone branch, creating it if needed, with no review.

Spec · round 3 (2026-10-11):

- Q1 The final Spec-only check and `mNN`: **A**. It runs once, in whichever run lands the last milestone, plain or `mNN`; a plain run on a fully landed feature reports that and stops, changing nothing.
- Q2 Review reports across fix cycles: **A**. Each later review replaces `reviews/m<NN>-<slug>.md` in a new commit on the milestone branch; git history keeps the earlier ones.

The user raised no objection to the architect's round 3 self-settled decisions:
- Scheduling ranks dependency chains among the current milestone's tickets only.
- The build refuses to start if a ticket has no `milestone` while the spec declares milestones, or names an undeclared milestone.
- Settings are four bullets in the `## Agent workflow` block: `Parallel cap`, `Parallel test suites` (yes/no), `Pause between milestones` (on/off), `Install command` (a command, or `none`). Every mode, including `tNN`, stops on a missing setting.
- `implement-ticket` gains a third hand-back, `stuck` with the failing check, which triggers the Opus retry.
- Ticket `in-progress` commits, developer-answer commits and saved review reports go on the current milestone branch.
- `/alper:review` run by the user works as today; only `/alper:build` passes it the milestone scope.
