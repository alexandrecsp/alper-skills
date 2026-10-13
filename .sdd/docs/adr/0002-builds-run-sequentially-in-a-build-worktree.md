# Builds run sequentially in a build worktree

`/alper:build` builds a feature's tickets one at a time, in number order, inside a dedicated worktree at `.claude/worktrees/<feature>`; each developer commits straight onto the milestone branch, and the build itself makes the conflict-free milestone merge into `feat/<feature>`. This replaces parallel ticket builds under a cap: their parallelism needed a merger to resolve conflicts, a `touches` field to schedule around overlaps, two build settings, an install per ticket worktree, and a main checkout the user could not touch during a build. Parallelism moves up a level: two features build at once in separate sessions, each in its own worktree. Milestone branches still gate the feature branch ([ADR 0001](0001-milestone-branches-gate-the-feature-branch.md)).

## Considered options

- **Parallel tickets under a cap** (the previous design): faster on wide milestones, at the cost of the merger, overlap scheduling and per-ticket worktrees.
- **One developer agent for the whole spec**: a subagent cannot dispatch the two reviewers, and one context does not hold every ticket of a feature; rejected. The build dispatches a fresh developer per ticket instead.
- **A branch per ticket, merged into the milestone branch**: without parallel work there is nothing to integrate; one commit per ticket with its `Ticket:` trailer reverts just as well.

## Consequences

- A wide milestone takes longer in wall-clock time.
- The ticket's own commit marks it `done`, so reverting the commit reverts the status.
- Repos set up under the old design keep `Parallel cap` and `Parallel test suites` in their block until `/alper:setup-repository` re-runs and drops them; tickets keep harmless `branch` and `touches` fields.
