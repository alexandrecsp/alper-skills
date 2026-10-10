---
name: write-spec
description: Synthesizes a confirmed brainstorm into docs/.specs/<feature>/spec.md without re-interviewing, returning any decision the brainstorm left open. Use when turning settled decisions into a spec.
metadata:
  type: process
---

# Write Spec

## Overview

Turns decisions the user already made into a spec. It never interviews again: a decision the brainstorm did not settle goes back to the caller as a question, never into the spec as a guess.

## When to Use

- **Dispatched by `/alper:spec`** with a `brainstorm.md` path → run the Process.
- **Asked to write a spec from a discussion already in context** → run the Process with that discussion as the input.

## Process

### 1. Read the inputs

Read `docs/.specs/<feature>/brainstorm.md`, `GLOSSARY.md`, the ADRs in `docs/adr/`, the coding standards, and every module the decisions touch. Paths and formats: [artifacts](../../references/artifacts.md).

Done when: every module a decision touches has been opened, and you can name the existing pattern each change follows or departs from.

### 2. Return the gaps

List each decision the spec needs that the brainstorm does not settle: an interface shape, a data rule, a behaviour on failure, a choice between existing patterns. If the list is not empty, return its frontier as one round in the question format of [brainstorm step 2](../brainstorm/SKILL.md#2-ask-the-frontier), shaped so the caller can show it unchanged, and stop:

- Group the questions under `**Domain**` (business rules and their edge cases), then `**Technical**`.
- Number them Q1 to QN in the order they appear, with no gaps.
- Below the round, list each held-back question as `Next round: <title> (waits on Q<n>)`.

Done when: the list is empty, or the round has been returned numbered Q1 to QN in reading order.

### 3. Choose the test seams

Pick the public interfaces the tests will go through. Prefer seams that already exist, and the highest one that observes the behaviour; every new seam is a cost.

Done when: each user-visible behaviour in the brainstorm has a seam that can observe it.

### 4. Write the spec

Write `docs/.specs/<feature>/spec.md` with the frontmatter from [artifacts](../../references/artifacts.md) (`status: draft`, `tickets: none`) and this body:

```markdown
# Spec: <feature title>

## Problem Statement
<the problem, from the user's perspective>

## Solution
<the solution, from the user's perspective>

## User Stories
1. As a <actor>, I want <capability>, so that <benefit>
   <one story per distinct behaviour, covering every branch the brainstorm settled>

## Implementation Decisions
<modules built or changed, their interfaces, schema changes, API contracts, the patterns
 followed and why. Name modules and interfaces, not file paths.>
<one line per design-patterns pattern applied: `<module>: <pattern> — <the problem it solves>`>

## Testing Decisions
<the seams from step 3, what each catches, and prior-art tests in the codebase>

## Out of Scope
<everything the brainstorm put out of scope>

## Success Criteria
- [ ] <a checkable outcome>
```

Use `GLOSSARY.md` terms throughout. A code snippet belongs in the spec only when it is the contract itself (a schema, a type shape, a state machine).

Done when: every brainstorm decision appears in the spec, every pattern applied names the `design-patterns` problem that earns it, and every Success Criterion can be checked by running something or reading one artifact.

### 5. Settle the language

For each domain term the spec introduces or sharpens, apply `domain-modeling`.

Done when: every domain term in the spec is in `GLOSSARY.md` with the same meaning.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The obvious answer is clear, I'll just write it in" | Obvious to you is a guess to the user. Return it as a question with your recommendation. |
| "File paths make the spec concrete" | Paths go stale before the build ends. Name the module and its interface. |
| "A few user stories cover it" | Each distinct behaviour gets a story; the Spec reviewer checks the build against them. |
| "Success criteria can be qualitative" | The Spec reviewer has to check them. Write each one as something you can run or read. |

## Red Flags

- A decision in the spec that cannot be traced to `brainstorm.md` (step 2)
- A spec written while gap questions were still open (step 2)
- File paths or code that is not a contract (step 4)
- A user-visible behaviour with no seam in Testing Decisions (step 3)
- A domain word used differently from `GLOSSARY.md` (step 5)

## Verification

- [ ] Every decision in the spec traces to `brainstorm.md` or a returned-and-answered question.
- [ ] Every section of the template is filled, and `Out of Scope` names at least one thing.
- [ ] Every Success Criterion is checkable.
- [ ] Every user-visible behaviour has a test seam.
- [ ] Every domain term matches `GLOSSARY.md`.
