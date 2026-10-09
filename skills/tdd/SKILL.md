---
name: tdd
description: Implements behaviour test-first in red-green cycles through public seams, one acceptance criterion at a time. Use when implementing a ticket, a feature or a bug fix test-first.
metadata:
  type: process
---

# TDD

## Overview

One **tracer bullet** at a time: one test at the agreed seam goes **red** for the right reason, the least code turns it green, then the next. Tests verify behaviour through public interfaces, so they survive any refactor that keeps the behaviour.

## When to Use

- **Implementing a ticket or review finding** → run the Process once per acceptance criterion or finding.
- **Fixing a bug** → run the Process with the bug as the criterion: the first test reproduces it.

## Process

### 1. Pick the criterion and its seam

Take the next unmet acceptance criterion. Test at the seam the ticket names (`## Test seams`); when it names none, use the highest existing public interface that observes the behaviour.

Done when: you can say which interface the test calls and what it asserts.

### 2. Red

Write one test for that criterion. Name it as the behaviour ("rejects an expired coupon"). Take the expected value from an independent source: a literal, a worked example, the spec. Run it.

Done when: the test fails, and the failure message shows the missing behaviour, not a typo, import error or broken setup.

### 3. Green

Write the least code that makes the test pass. Run the test, then the tests next to it.

Done when: the new test and its neighbours pass.

### 4. Tidy

With everything green, remove duplication you just introduced and make names match `GLOSSARY.md`. Run the tests again.

Done when: the tests are still green and the new code reads as the project's own.

Repeat from step 1 until every criterion has a passing test.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I'll write all the tests first" | Tests for code you haven't shaped test imagined behaviour. Write one, make it pass, then the next. |
| "It's faster to write the code and test after" | A test you never saw red may pass for the wrong reason. Watch every test fail first. |
| "Mocking the collaborator is simpler" | A mocked internal ties the test to the implementation. Test through the seam; mock only what crosses a system boundary (network, clock, external service). |
| "`expect(add(a, b)).toBe(a + b)` covers it" | An expected value computed like the code can't disagree with the code. Use an independent literal. |

## Red Flags

- Several failing tests written before any code (step 2)
- A test that passed the first time it ran (step 2)
- A test that reaches into private state or asserts on internal calls (step 1)
- Code added that no failing test asked for (step 3)
- A criterion with no test, or a test with no criterion (step 1)

## Verification

- [ ] Every acceptance criterion has a test, named as the behaviour.
- [ ] Every test was seen failing for the right reason before its code existed.
- [ ] Every test goes through a public seam.
- [ ] Every expected value comes from a source independent of the code.
