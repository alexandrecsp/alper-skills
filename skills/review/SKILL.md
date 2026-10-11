---
name: review
argument-hint: "[fixed-point]"
description: Runs a two-axis review, Standards and Spec, of a branch against a fixed point, as two parallel code-reviewer runs reported side by side. Use when reviewing a branch, a PR or work in progress, or when /alper:build finishes a milestone or lands the last one.
metadata:
  type: process
---

# Review

## Overview

Reviews the diff between `HEAD` and a fixed point on two axes that never see each other's reasoning: **Standards** (how the repo says code is written) and **Spec** (what the spec and tickets asked for). Each axis runs as its own `code-reviewer` dispatch, in parallel.

## When to Use

- **The user asks to review a branch, PR or work in progress** → run the Process and report to the user.
- **`/alper:build` finishes a milestone**, passing `feat/<feature>` as the fixed point and a **milestone scope** (the milestone's ticket ids, user story numbers and success criteria) → run the Process; the Spec axis judges only that scope. Return the report to the build.
- **`/alper:build` lands the last milestone**, passing `base` as the fixed point and **Spec-only** → run the Process with the Spec axis alone, over the whole spec. Return the report to the build.

The scope and Spec-only are inputs only `/alper:build` passes; without them, the Process reviews both axes against the whole spec.

## Process

### 1. Pin the fixed point

Use the fixed point the user or caller gave (a branch, tag or commit). On `feat/<feature>` with no argument, use `base` from `docs/.specs/<feature>/spec.md`. Otherwise ask.

Done when: `git rev-parse <fixed-point>` resolves and `git diff <fixed-point>...HEAD` is not empty.

### 2. Find the spec

In order: a path the user passed; `docs/.specs/<feature>/spec.md` when the branch is `feat/<feature>` or `milestone/<feature>/m<NN>-<slug>`; the `Ticket:` trailers in `<fixed-point>..HEAD`, whose `<feature>/NN` names a feature under `docs/.specs/`. When none is found, ask the user; if there is none, the Spec axis reports "no spec available".

Done when: the spec path is known, or confirmed absent.

### 3. Find the standards sources

List every file that documents how code is written here: `docs/CODING_STANDARDS.md`, `CONTRIBUTING.md`, `CLAUDE.md` / `AGENTS.md`, and anything they point to.

Done when: the list is complete, or empty.

### 4. Dispatch both axes in parallel

Dispatch two `alper:code-reviewer` runs in the same turn, or the Spec run alone when the caller asked for Spec-only. Each prompt carries:

- the axis: `Standards` or `Spec`
- `git diff <fixed-point>...HEAD` and `git log --oneline <fixed-point>..HEAD`
- Standards: the source list from step 3
- Spec: the spec path and its tickets directory, plus the milestone scope when the caller passed one

Done when: every dispatched report has returned.

### 5. Report side by side

Combine the reports unchanged under `## Standards` and `## Spec` (Spec-only: `## Spec` alone), then end with a one-line verdict:

- **Clean**: no gaps and no hard violations.
- **Fix**: gaps or hard violations listed, with a count of each.

Judgement calls and extras never change the verdict; they are the user's to decide. Saving the report is the caller's job.

Done when: the combined report and verdict are delivered to the user or returned to the caller.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "One reviewer can cover both axes" | A reviewer that judged the style has already formed a view of the intent. Run the axes as separate dispatches. |
| "No spec, so skip the Spec axis silently" | Ask first. Report "no spec available" only when the user confirms there is none. |
| "Spec-only was asked, but a Standards pass is cheap" | Standards was already reviewed per milestone. Dispatch the Spec axis alone. |
| "This smell is clearly wrong, count it as a violation" | Smells are judgement calls. Only a documented repo standard makes a hard violation. |

## Red Flags

- An empty diff or unresolved ref discovered after dispatch (step 1)
- Both axes run in one dispatch, or one after the other (step 4)
- A Standards dispatch when the caller asked for Spec-only, or a scoped review whose Spec prompt lacks the scope (step 4)
- A verdict of Fix based only on judgement calls or extras (step 5)
- Findings rewritten or dropped while combining (step 5)

## Verification

- [ ] The fixed point resolved and the diff was non-empty before dispatch.
- [ ] The spec was found, or confirmed absent with the user.
- [ ] Both axes ran as separate parallel `code-reviewer` dispatches, or the Spec axis alone when the caller asked for Spec-only, carrying the milestone scope when one was passed.
- [ ] The report shows both axes unchanged, with a verdict based only on gaps and hard violations.
