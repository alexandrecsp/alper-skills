---
name: review-standards
description: Reviews a diff against the repo's documented coding standards plus a code-smell baseline, separating hard violations from judgement calls. Use when running the Standards axis of a review.
metadata:
  type: reference
---

# Review: Standards

## Overview

Checks whether a diff follows how this repo says code should be written. A documented repo standard can be a hard violation; a baseline smell is always a judgement call, and the repo overrides the baseline wherever they disagree.

## When to Use

- **Dispatched as the Standards axis** with a diff command and a list of standards sources → apply every rule below to every hunk.

## Sources

1. Every file that documents how code is written here: `.sdd/docs/CODING_STANDARDS.md`, `CONTRIBUTING.md`, the rules in `CLAUDE.md` / `AGENTS.md`, and any file those point to.
2. The smell baseline below.

Skip anything a linter, formatter or type checker in the repo already enforces.

## Smell baseline

Each smell: what it is → the fix to suggest.

- **Mysterious Name**: a name that does not say what the thing does or holds → rename it; if no honest name comes, the design is murky.
- **Duplicated Code**: the same logic shape in more than one hunk or file → extract it and call it from both.
- **Feature Envy**: a function that uses another object's data more than its own → move it to that data.
- **Data Clumps**: the same few fields or parameters travelling together → bundle them into one type.
- **Primitive Obsession**: a primitive standing in for a domain concept → give the concept its own small type.
- **Repeated Switches**: the same `switch` or `if` cascade on one type in several places → one map or polymorphism.
- **Shotgun Surgery**: one logical change scattered across many files → gather what changes together.
- **Divergent Change**: one module edited for unrelated reasons → split it so each part changes for one reason.
- **Speculative Generality**: parameters, hooks or abstractions the spec does not need → inline them back.
- **Unearned Pattern**: a design pattern (factory, strategy, observer, ports…) that no spec decision names and no `design-patterns` problem in the diff earns → plain code.
- **Message Chains**: `a.b().c().d()` navigation the caller should not depend on → hide the walk behind one method.
- **Middle Man**: a unit that mostly delegates → call the real target.
- **Refused Bequest**: an implementer that ignores most of what it inherits → composition instead of inheritance.

## Report

Under 400 words, in this shape:

```
## Standards

### Hard violations
- <file>:<line> — <what> — breaks <source file>: "<the rule>"

### Judgement calls
- <file>:<line> — possible <Smell> — <the hunk, quoted briefly> — suggest: <fix>

Sources read: <list>
```

Write "none" under a heading with no findings.

## Verification

- [ ] Every standards source was read, and is listed in the report.
- [ ] Every hunk in the diff was checked against every source and every smell.
- [ ] Every hard violation cites its source file and rule.
- [ ] Every smell is labelled "possible" and suppressed where a repo standard endorses the pattern.
