---
name: draw-visual
description: Draws a Mermaid diagram, a chart or a standalone HTML view from code, a spec or data, render-checks it, and writes it in place. Use when a document, spec or PR needs a diagram or chart, when data needs a chart or dashboard, or when a draw marker needs replacing.
metadata:
  type: process
---

# Draw Visual

## Overview

Turns a source into one picture that renders and draws nothing the source does not show. A drawing is written only after it has rendered: Mermaid through the Mermaid CLI, HTML through a headless screenshot you look at in both colour schemes.

## When to Use

- **Dispatched by `/alper:draw` or `/alper:spec`** → run the Process on the request in your prompt.
- **A document, spec or PR needs a diagram or chart, or data needs a chart or dashboard** → run the Process.
- **A `<!-- draw: … -->` marker needs replacing** → run the Process once per marker; marker format in [artifacts](../../references/artifacts.md#draw-marker).
- **The UI ships in the app** → build it as a ticket through `/alper:build`; this skill draws disposable views only.

## Process

### 1. Pin the request

Name three things: the **kind** (diagram, chart or view), the **source** (files, a spec section, data), and the **target** (a markdown file and the marker or location in it, or an output path). A chart or view with no path goes to `.sdd/docs/drawings/<slug>.html`. Return anything still open to the caller as a numbered question with your recommendation, and stop.

Done when: kind, source and target are each named.

### 2. Trace the source

Read the source and list every element the drawing will hold (each node, edge, state, entity or data point) with where it comes from: a `file:line`, a spec heading, a data row. Take names verbatim from the code and `.sdd/GLOSSARY.md`. An element you cannot trace stays out of the drawing.

Done when: every listed element has a source, and nothing on the list was inferred.

### 3. Choose the form

Pick the diagram type or chart form from the [style bar](#style-bar), and write one line: `Form: <choice> — <why it fits this question>`. When the elements exceed the size limits, split into an overview plus one detail drawing per group, and say so in the same line.

Done when: the form line is written.

### 4. Draft against the style bar

Draft the drawing and check it against every rule in the [style bar](#style-bar) for its kind.

Done when: every rule for the kind holds.

### 5. Render-check

Save the draft in a temporary directory outside the repo and render it:

- **Mermaid** (diagrams, and charts inside markdown): `npx -y @mermaid-js/mermaid-cli -i draft.mmd -o draft.svg`. It must exit 0 with no parse error.
- **HTML** (charts and views): `npx -y playwright screenshot --full-page --color-scheme=light file://<draft> light.png`, then again with `--color-scheme=dark`. On the first run, `npx -y playwright install chromium`. Open both screenshots and check them against the style bar: no overlaps, no clipped or unreadable labels, nothing blank.

Fix and render again, up to 3 attempts. Still failing, or `npx` unavailable → write nothing, return the error and the last source to the caller, and stop.

Done when: the drawing renders clean (for HTML, in both screenshots), or the failure has been returned.

### 6. Write in place

- **Mermaid**: replace the marker, or the existing diagram block, or insert at the given location, as one fenced `mermaid` block.
- **HTML**: write the file at the target path.

Change nothing outside the drawing.

Done when: `git diff` shows only the drawing.

### 7. Return

Return the paths written, the form line, and the source list from step 2 in one line per source file.

Done when: the return holds all three.

## Style bar

**Every kind**
- Labels: at most 5 words, names verbatim from the source. Edge labels say what flows.
- Colour encodes meaning or stays default. Categorical colours come from Okabe-Ito, in this order: `#0072B2`, `#E69F00`, `#009E73`, `#CC79A7`, `#56B4E9`, `#D55E00`. They read on light and dark backgrounds.

**Diagrams (Mermaid)**
- Type by question: `flowchart` for control or data flow, `sequenceDiagram` for interactions over time, `stateDiagram-v2` for a lifecycle, `erDiagram` for a data model, `classDiagram` for type structure.
- At most 15 nodes or participants; beyond that, split (step 3).
- `LR` for pipelines, `TD` for hierarchies.
- Leave theming to the renderer, so GitHub's light and dark themes both apply. A `classDef` carries meaning, uses the palette, and there are at most 3.

**Charts**
- Form by question: bar to compare categories, line for change over time, stacked bar for parts of a whole across groups, scatter for a relationship. A pie only for at most 5 parts of one whole.
- Inside markdown: Mermaid `xychart-beta` or `pie`. Anything richer: an HTML view with Chart.js pinned to an exact version from `cdn.jsdelivr.net`.
- The title states the takeaway. Axes are labelled with units, and a bar axis starts at zero.
- At most 6 series. Values are drawn as the source gives them, never smoothed or filled in.

**Views (HTML)**
- One self-contained file: inline CSS and JS, and the only external script is the pinned charting library.
- Colours are CSS custom properties on `:root`, overridden under `@media (prefers-color-scheme: dark)`. `body` sets its background explicitly.
- Reads at 360px and at 1280px wide with no horizontal scroll. Body text is at least 14px.
- A footer names the source and the date it was drawn.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "This edge is obviously there" | Draw only what step 2 traced. Leave out anything you can't trace, or return a question. |
| "The Mermaid syntax is simple, it'll render" | Run the CLI. Parse errors hide in quotes, brackets and reserved words. |
| "One screenshot is enough" | Take both schemes. Dark mode is where hard-coded colours fail. |
| "The diagram is big but still readable" | Past 15 nodes, split into overview plus detail and say so in the form line. |
| "The prose around it needs a tweak to match" | That prose belongs to the doc's owner. Write only the drawing, and mention the mismatch in your return. |
| "It almost renders, I'll write it and flag it" | After 3 attempts, write nothing and return the error with the last source. |
| "Two layouts both work, I'll offer both" | Pick one and state why in the form line. |

## Red Flags

- A node, edge or value with no source in the step 2 list (step 2)
- No `Form:` line in the return (step 3)
- A drawing written with no render command run before it (step 5)
- An HTML drawing checked in only one colour scheme (step 5)
- A drawing written after the third failed render (step 5)
- `git diff` touching lines outside the drawing (step 6)
- Hard-coded `style` fills or colours from outside the palette (step 4)

## Verification

- [ ] Every element in the drawing appears in the step 2 source list.
- [ ] The form line names the choice and its reason.
- [ ] Every style bar rule for the kind holds.
- [ ] The render command exited 0 (Mermaid), or both screenshots were inspected clean (HTML).
- [ ] `git diff` shows only the drawing, or nothing was written and the error was returned.
- [ ] The return lists paths, the form line and the sources.
