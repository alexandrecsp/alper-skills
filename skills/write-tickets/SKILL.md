---
name: write-tickets
description: Breaks an approved spec into tracer-bullet vertical-slice tickets with blocking edges under docs/.specs/<feature>/tickets/. Use when slicing a spec into tickets.
metadata:
  type: process
---

# Write Tickets

## Overview

Cuts an approved spec into **tracer bullets**: narrow slices through every layer, each verifiable on its own. Blocking edges are kept to the ones that truly gate a ticket, because every unblocked ticket is built in parallel.

## When to Use

- **Dispatched by `/alper:spec`** after the spec is approved → run the Process.
- **Asked to re-slice existing tickets** → run the Process and rewrite the ticket files that changed.

## Process

### 1. Read the spec and the code

Read `docs/.specs/<feature>/spec.md` (its `status` must be `approved`) and the modules its Implementation Decisions name. Formats: [artifacts](../../references/artifacts.md).

Done when: the spec is approved, and you can name the module each User Story lands in.

### 2. Find the prefactoring

Look for changes that make the feature easy before the feature starts: an extraction, a seam the tests need, a renamed concept. Each becomes its own ticket that blocks the slices that need it.

Done when: every slice can be built without first restructuring code another slice also touches.

### 3. Cut vertical slices

- Each slice cuts a narrow, complete path through every layer it needs (schema, logic, interface, tests) and is demoable or testable alone.
- Each slice fits one fresh context: one developer can read it, its spec sections and the code it touches, and finish.
- **Wide refactors** are the exception: one mechanical change whose blast radius breaks callers across the codebase. Sequence it **expand–contract**: an expand ticket adds the new form beside the old; migrate tickets, each blocked by expand, move callers in batches; a contract ticket, blocked by every migrate ticket, removes the old form.

Done when: every slice is vertical or part of an expand–contract sequence.

### 4. Set the blocking edges

For each ticket, list in `blocked-by` only the tickets whose merged code it needs to compile, pass its tests or make sense. Prefer the breakdown with the widest frontier: two tickets that only touch neighbouring code do not block each other; the merger resolves their conflicts.

Done when: every edge names what the blocked ticket uses from its blocker, and the graph has no cycle.

### 5. Write the tickets

Write one file per ticket using the ticket template in [artifacts](../../references/artifacts.md), `status: todo`, numbered blockers first. Each acceptance criterion is an observable behaviour a test can prove.

Done when: every User Story and Success Criterion in the spec is covered by at least one ticket's acceptance criteria.

### 6. Return the breakdown

Return a table the caller can show the user:

| NN | Title | Blocked by | What it delivers |
|---|---|---|---|

Add the frontier waves under it (wave 1: tickets with no blockers; wave 2: tickets unblocked by wave 1; …).

Done when: the table and the waves are returned.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Schema first, then API, then UI is cleaner" | Horizontal layers make every ticket block the next. Slice vertically so tickets run in parallel. |
| "Add the edge to be safe" | Every extra edge serializes the build. Add an edge only for code the ticket uses. |
| "The refactor is small, fold it into the first slice" | A prefactor inside a slice blocks every other slice that touches it. Ticket it first. |
| "This acceptance criterion is self-evident" | The developer writes a test per criterion. Write each as a behaviour a test can observe. |

## Red Flags

- A ticket that changes one layer only, outside an expand–contract sequence (step 3)
- An edge with no named dependency (step 4)
- A spec User Story that no acceptance criterion covers (step 5)
- A ticket too large to read with its code in one context (step 3)

## Verification

- [ ] The spec was `approved` before slicing.
- [ ] Every ticket is a vertical slice or a step of an expand–contract sequence.
- [ ] Every `blocked-by` edge names what the ticket uses from its blocker, and the graph is acyclic.
- [ ] Every User Story and Success Criterion is covered by an acceptance criterion.
- [ ] Every ticket file matches the template and is numbered blockers first.
- [ ] The breakdown table and frontier waves were returned.
