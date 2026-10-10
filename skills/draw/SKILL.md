---
name: draw
argument-hint: "[what to draw] [target]"
description: Draw a Mermaid diagram, chart or standalone HTML view via the drawer, render-checked and written in place.
disable-model-invocation: true
metadata:
  type: process
---

# Draw

## Overview

Gets one drawing made by the `alper:drawer`. The drawer starts with a fresh context and can't ask the user anything, so this skill settles what to draw, its source and its target before dispatching, and shows the user whatever comes back.

## When to Use

- **The user runs `/alper:draw`** → run the Process.
- **A spec has draw markers** → `/alper:spec` dispatches the drawer itself.

## Process

### 1. Pin the request

Take what to draw from the first argument and the target from the second, filling the gaps from the conversation:

- **Source**: the files, spec section or data to draw from. Write data that lives only in the conversation to a file in a temporary directory, and pass its path.
- **Target**: a markdown file and the location in it for a diagram, or an output path for a chart or view (default `docs/drawings/<slug>.html`, per [artifacts](../../references/artifacts.md)).

Ask the user for anything still open.

Done when: what, source and target are each named.

### 2. Dispatch the drawer

Dispatch `alper:drawer`: "Apply `draw-visual`: draw <what> from <source> into <target>."

- **It returns questions** → put them to the user, then dispatch again with the answers.
- **It returns a render failure** → show the user the error and the last source, and ask whether to retry with a change or stop.
- **It returns paths** → continue.

Done when: the drawer returned paths, or the user chose to stop.

### 3. Show the result

Show the paths, the drawer's form line and the source list. For a diagram, also show the block it wrote. Then end the turn.

Done when: the user has the result and the turn has ended.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I can draw it here, it's quicker" | Dispatch the drawer. It owns the render check and the style bar. |
| "The drawer can see the data we discussed" | It starts with a fresh context. Pass the data as a file path. |
| "Its recommended answer is fine" | The decision belongs to the user. Put every returned question to them. |

## Red Flags

- The drawer dispatched with no target named (step 1)
- Data from the conversation missing from the dispatch prompt (step 1)
- A returned question answered without the user (step 2)
- A drawing produced in this thread instead of by the drawer (step 2)

## Verification

- [ ] The dispatch prompt named what to draw, its source and its target.
- [ ] Every question the drawer returned was answered by the user.
- [ ] The user saw the paths, the form line and the sources, or the render error.
