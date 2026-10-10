---
name: design-patterns
description: Catalogs the design patterns alper designs and builds with (API design, frontend UI, hexagonal, and the GoF Strategy, State, Factory Method, Adapter, Observer, Decorator, Command and Template Method), each one earned by the problem it solves. Use when designing modules or interfaces, when a ticket names a pattern, or when reviewing code that applies one.
metadata:
  type: reference
---

# Design Patterns

## Overview

A catalog of patterns, one reference file each, reached through the index below. A pattern is **earned**: it enters a design only when the feature has the problem the pattern solves, today. Plain code is the default answer, and "no pattern" is a complete design decision.

## When to Use

- **Designing a module or interface** → walk the index for every module the design touches; read the file of each problem that matches.
- **A ticket's notes name a `design-patterns` file** → read it before the first test, and build to its Shape and Rules.
- **Reviewing code that applies a pattern** → read its file, and check the code against its Rules and Misuse signs.
- **Adding a pattern to the catalog** → write it from [references/pattern-template.md](references/pattern-template.md) and add one line to the index.

## Index

```
The design has this problem, now
├── Other code depends on this interface (HTTP, module boundary, props) → references/api-design.md
├── Building or changing UI ──────────────────────────────────────────→ references/frontend-ui.md
├── Domain rules must run without the database, HTTP or framework ─────→ references/hexagonal.md
├── One job, several interchangeable algorithms picked at runtime ────→ references/strategy.md
├── Behaviour depends on a lifecycle state with allowed transitions ──→ references/state.md
├── The caller must not know which concrete type gets created ────────→ references/factory-method.md
├── An existing interface doesn't match the one your code expects ────→ references/adapter.md
├── Several parts react to a change the source shouldn't know about ──→ references/observer.md
├── Add behaviour around an object (cache, retry, log) without editing it → references/decorator.md
├── A request must be queued, logged, retried or undone as a value ───→ references/command.md
└── Several procedures share their steps and differ in a few ─────────→ references/template-method.md
```

Files: [api-design](references/api-design.md) · [frontend-ui](references/frontend-ui.md) · [hexagonal](references/hexagonal.md) · [strategy](references/strategy.md) · [state](references/state.md) · [factory-method](references/factory-method.md) · [adapter](references/adapter.md) · [observer](references/observer.md) · [decorator](references/decorator.md) · [command](references/command.md) · [template-method](references/template-method.md)

## Rules

- **Earned**: name the problem from the index that this feature has now. A problem the feature might have later earns nothing yet.
- **The repo wins**: when the codebase already solves the problem a known way, follow it, and name that convention instead of a catalog pattern.
- **Read before naming**: open a pattern's file before putting its name in a spec, a ticket or a finding.
- **Sketches are shapes**: each file's TypeScript sketch shows the roles. Use the repo's names, language and framework for the real code.

## Verification

- [ ] Every pattern applied traces to a problem in the index that the feature has now.
- [ ] Every pattern named was read from its file first.
- [ ] Where the repo already solves the problem, its convention was followed.
