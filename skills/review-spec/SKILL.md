---
name: review-spec
description: Reviews a diff against its spec and tickets, reporting each acceptance criterion as met or as a gap, and any change the spec does not ask for. Use when running the Spec axis of a review.
metadata:
  type: reference
---

# Review: Spec

## Overview

Checks whether the diff delivers what the spec and tickets promised, no less and no more. Every finding cites the criterion or the spec line it is measured against.

## When to Use

- **Dispatched as the Spec axis** with a diff command and a spec path → apply every rule below.
- **Dispatched with a milestone scope** (ticket ids, user story numbers, success criteria) → apply every rule below, judging only the scoped tickets' acceptance criteria, the scoped user stories and the scoped success criteria.
- **Dispatched with no spec available** → report "no spec available" and stop.

## Rules

- **Acceptance criteria**: each criterion in every ticket under `.sdd/specs/<feature>/tickets/` is *met* only when the diff contains code that delivers it and a test that proves it. Code without a test is a gap.
- **Success criteria**: each Success Criterion in `spec.md` is met, a gap, or "checked at release" when it can only be checked by a run outside the diff.
- **Implementation decisions**: each decision in the spec is followed by the diff, or the deviation is a gap.
- **Out of scope**: anything the spec puts out of scope that the diff does anyway is a gap.
- **Extras**: a change no criterion, story or decision asks for is reported as an extra. An extra is not wrong by itself; it needs the user's yes. The build's own records under `.sdd/specs/<feature>/` (ticket statuses, `reviews/`, follow-up decisions in `brainstorm.md`) and the Gotchas it adds to the `## Agent workflow` block are never extras.
- **Scope**: with a milestone scope, Implementation Decisions, Out of Scope and extras are still checked against the whole diff; only criteria and stories outside the scope go unjudged.

Paths: [artifacts](../../references/artifacts.md).

## Report

Under 400 words, in this shape:

```
## Spec

### Gaps
- <ticket NN / spec section> — "<criterion>" — <what is missing or wrong, with file:line>

### Extras
- <file>:<line> — <the change> — not asked for by the spec

Met: <n> of <m> acceptance criteria, <n> of <m> success criteria (in scope, when scoped)
```

Write "none" under a heading with no findings.

## Verification

- [ ] Every acceptance criterion of every ticket in scope (every ticket, when unscoped) was judged met or gap, with evidence.
- [ ] Every Success Criterion and Implementation Decision was checked.
- [ ] Every finding cites the criterion or spec line it is measured against.
- [ ] Every changed file was traced to a criterion, story or decision, or reported as an extra.
