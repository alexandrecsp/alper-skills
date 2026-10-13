---
name: write-tickets
description: Breaks an approved spec into tracer-bullet vertical-slice tickets with blocking edges under docs/.specs/<feature>/tickets/. Use when slicing a spec into tickets.
metadata:
  type: process
---

# Write Tickets

## Overview

Cuts an approved spec into **tracer bullets**: narrow slices through every layer, each verifiable on its own. `/alper:build` builds them one at a time in number order, so the numbering puts every blocker first and each edge names what its ticket uses.

## When to Use

- **Dispatched by `/alper:spec`** after the spec is approved → run the Process.
- **Asked to re-slice existing tickets** → run the Process and rewrite the ticket files that changed.

## Process

### 1. Read the spec and the code

Read `docs/.specs/<feature>/spec.md` (its `status` must be `approved`) and the modules its Implementation Decisions name. Formats: [artifacts](../../references/artifacts.md).

Done when: the spec is approved, and you can name the module and the milestone each User Story lands in.

### 2. Find the prefactoring

Look for changes that make the feature easy before the feature starts: an extraction, a seam the tests need, a renamed concept. Each becomes its own ticket that blocks the slices that need it.

Done when: every slice can be built without first restructuring code another slice also touches.

### 3. Cut vertical slices

- Each slice cuts a narrow, complete path through every layer it needs (schema, logic, interface, tests) and is demoable or testable alone.
- Each slice fits one fresh context: one developer can read it, its spec sections and the code it touches, and finish.
- **Wide refactors** are the exception: one mechanical change whose blast radius breaks callers across the codebase. Sequence it **expand–contract**: an expand ticket adds the new form beside the old; migrate tickets, each blocked by expand, move callers in batches; a contract ticket, blocked by every migrate ticket, removes the old form.

Done when: every slice is vertical or part of an expand–contract sequence.

### 4. Set the blocking edges

For each ticket, list in `blocked-by` only the tickets whose code it needs to compile, pass its tests or make sense. A blocked ticket stops the build, and only its dependents should wait on it.

Give each ticket the milestone of the stories it delivers. A ticket may be blocked only by tickets in its own milestone or an earlier one: the build lands milestones in order, so an edge to a later milestone waits forever. When an edge points forward, move the blocker to the earlier milestone or re-slice.

Done when: every edge names what the blocked ticket uses from its blocker, the graph has no cycle, and no edge points to a later milestone.

### 5. Write the tickets

Write one file per ticket using the [ticket template](../../references/artifacts.md#ticket-file), `status: todo`, numbered in build order: milestone by milestone, blockers first. Each acceptance criterion is an observable behaviour a test can prove. Fill `milestone` with the milestone's `NN`.

Done when: every User Story and Success Criterion in the spec is covered by at least one ticket's acceptance criteria, every ticket has `milestone`, and every `blocked-by` id is lower than its ticket's.

### 6. Return the breakdown

Return a table the caller can show the user:

| NN | Title | Milestone | Blocked by | What it delivers |
|---|---|---|---|---|

Done when: the table is returned, in build order.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Schema first, then API, then UI is cleaner" | Horizontal layers leave nothing testable until the last one lands. Slice vertically so each ticket is verifiable alone. |
| "Add the edge to be safe" | A needless edge stops the ticket when its blocker is blocked. Add an edge only for code the ticket uses. |
| "This ticket needs a later milestone's work, the build will sort it out" | The build refuses the breakdown. Move the blocker earlier or re-slice. |
| "The refactor is small, fold it into the first slice" | A prefactor inside a slice hides a restructure in a feature commit and grows the slice. Ticket it first. |
| "This acceptance criterion is self-evident" | The developer writes a test per criterion. Write each as a behaviour a test can observe. |

## Red Flags

- A ticket that changes one layer only, outside an expand–contract sequence (step 3)
- An edge with no named dependency (step 4)
- A `blocked-by` id in a later milestone than the ticket (step 4)
- A ticket with no `milestone`, or numbered before one of its blockers (step 5)
- A spec User Story that no acceptance criterion covers (step 5)
- A ticket too large to read with its code in one context (step 3)

## Verification

- [ ] The spec was `approved` before slicing.
- [ ] Every ticket is a vertical slice or a step of an expand–contract sequence.
- [ ] Every `blocked-by` edge names what the ticket uses from its blocker, points to the same or an earlier milestone, and the graph is acyclic.
- [ ] Every ticket has `milestone` (a declared milestone) and a higher number than each of its blockers.
- [ ] Every User Story and Success Criterion is covered by an acceptance criterion.
- [ ] Every ticket file matches the template and is numbered blockers first.
- [ ] The breakdown table, with `Milestone`, was returned in build order.
