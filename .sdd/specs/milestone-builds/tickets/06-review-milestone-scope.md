---
id: "06"
title: Review accepts a milestone scope and a Spec-only mode
status: done
blocked-by: []
branch: ticket/milestone-builds/06-review-milestone-scope
milestone: "01"
touches: ["review", "review-spec"]
---

## What it delivers

`review` accepts two optional inputs only `/alper:build` passes: a milestone scope (ticket ids, user story numbers, success criteria) and Spec-only. With a scope, both axes review `git diff feat/<feature>...HEAD` and the Spec axis judges only what the milestone promised; with Spec-only, only the Spec axis runs. Without either, `/alper:review` behaves exactly as today.

## Acceptance criteria

- [ ] `review`'s When to Use names the milestone-scope and Spec-only inputs as coming from `/alper:build`, and keeps the user-invoked route unchanged.
- [ ] With a milestone scope, the fixed point is `feat/<feature>` and both axes receive `git diff feat/<feature>...HEAD`, and the Spec prompt carries the scope.
- [ ] With Spec-only, step 4 dispatches the Spec axis alone and step 5 reports only `## Spec` with its verdict.
- [ ] `review` states that saving and committing the report is the caller's job.
- [ ] `review-spec` with a milestone scope judges only the scoped tickets' acceptance criteria, the scoped user stories and the scoped success criteria, and still checks Implementation Decisions, Out of Scope and extras against the diff; without a scope its rules are unchanged.
- [ ] Run without either input, every step of `review` reads as it does today (fixed point from the argument or `base`, both axes in parallel).
- [ ] `node skills/writing-for-agents/scripts/lint-skill.js .` and `claude plugin validate .` pass.

## Test seams

Structure seam (`lint-skill.js`). Behaviour scenarios 1 and 5 (one milestone review each, scoped) and the final Spec-only check in scenario 1, observed once tickets 07 and 10 land; a user-run `/alper:review` on any branch for story 37. Checked at release.

## Notes

- Spec sections: User Stories 10, 13 (the Spec-only input), 37; Implementation Decisions › `review` and `review-spec`; Out of Scope (changing `/alper:review` when the user runs it).
- No blocker: the scope is passed in as lists, so this needs no new artifact format.
- The `review` description still says "when /alper:build finishes a feature"; reword it for a milestone and keep the "Use when" trigger the linter requires.
- Checks: no typecheck or test suite; ticket tests and full suite are the two commands above.
