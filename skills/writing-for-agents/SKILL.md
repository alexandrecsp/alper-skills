---
name: writing-for-agents
description: Writes and reviews documents an agent reads, and holds skills to a checked structure contract. Use when creating or editing a skill, AGENTS.md or CLAUDE.md, or reviewing any agent-facing prompt, spec or doc.
metadata:
  type: reference
---

# Writing for Agents

## Overview

The reader has already read everything, so explanation is waste and precision is the job. The levers below make an agent take the same *process* on every run, whatever the packaging: a skill, an `AGENTS.md`, a prompt, a spec. Skills additionally follow a checked structure contract.

## When to Use

- **Writing or editing a skill** → apply the levers below, then read [references/skill-structure.md](references/skill-structure.md) and run its linter before calling the skill done.
- **Writing or editing `AGENTS.md`, `CLAUDE.md`, a system prompt, or a spec or ticket an agent will execute** → apply the levers below.
- **Reviewing an agent-written draft** → run the Pruning pass first; a draft written by an agent spends most of its words on what the model already knows.

This reference governs how a document reads. What it should say comes from the codebase and the people who own it.

## Context pointers

A **context pointer** is a line held in context that names out-of-context material and the condition for reaching it: a skill description, an `AGENTS.md` line naming a doc, a link from `SKILL.md` to a reference file. The pointer's *wording*, not its target, decides whether the agent reaches the material. When must-have material gets skipped, sharpen the pointer first; inline the material only if sharpening fails.

A pointer states what the material is and lists the **branches** that should trigger it (a branch is a distinct case the document handles). An always-loaded pointer is paid for on every turn, so prune it harder than any body text:

- Lead with the leading word: the pointer is where it does its triggering work.
- One trigger per branch. Synonyms naming the same branch collapse into one.
- Put the condition in the pointer: "Writing a skill → read X", never a bare "See X".
- Leave out what the body already carries.

## The two loads

- **Context load**: the cost of always-loaded material (a skill description, an `AGENTS.md` line) on the agent's window, paid every turn whether it fires or not.
- **Cognitive load**: the cost on the human of remembering which documents exist and when to reach for each. Spend it where human judgement matters; remove it where it does not.

Every placement trades one for the other. A pointer costs one always-loaded line; material with no pointer rides entirely on someone's memory.

## Information hierarchy

A document holds **steps** (ordered actions) and **reference** (rules and facts consulted on demand), in any mix. Place each piece on the ladder by how immediately the agent needs it:

1. **In-file step**: what the agent does, in order.
2. **In-file reference**: consulted on demand. A flat set of peer rules is a fine arrangement.
3. **Disclosed reference**: a separate file reached through a pointer, loaded only when the pointer fires.

The disclosure test is branching: inline what every branch needs, disclose what only some branches reach. Reference left inline among steps buries them and turns attending to each step into a coin-flip.

**Co-location** keeps a concept's definition, rules and caveats under one heading, so reading one part brings its neighbours. **Sprawl**, a document too long even when every line is live, is cured by the ladder: disclose, and split by branch.

## Completion criteria

Every step ends on a **completion criterion**, the condition that tells the agent the step is done.

- **Clarity**: the agent can tell done from not-done. A vague bound ("understand the code") invites **premature completion**, where visible later steps pull attention forward. Sharpen the criterion first. Only when it is irreducibly fuzzy *and* you observe the rush, split the sequence across a real context boundary (a handoff or a subagent), since an inline call leaves the later steps in view.
- **Demand**: how much it requires. "Every changed endpoint has a test" drives **legwork** that "add tests" does not. Demand binds reference as well as steps: "every rule applied" gives an all-reference document an exhaustiveness bar.

The strongest criteria are checkable and exhaustive.

## Leading words

A **leading word** is a compact concept the model already holds from pretraining (*tracer bullet*, *red*, *tight loop*) that the agent thinks with while running the document. Repeated as a token, it anchors a region of behaviour in the fewest words, and when the same word lives in your prompts and docs it also sharpens invocation. Prefer an existing word to a coined one: a coined word recruits no priors and costs its definition in tokens.

Hunt for passages that collapse into one: a triad repeated at three sites ("fast, deterministic, low-overhead" → *tight*), or a fuzzy gate that becomes a binary state ("a test you trust" → the test goes *red* on the bug).

**Frame positively.** Naming a forbidden behaviour makes it more available. State the target behaviour ("write one-line comments"); keep a prohibition only as a hard guardrail you cannot phrase positively, and pair it with the positive target.

## Pruning

- **Single source of truth**: each meaning lives in one place, so a behaviour change is a one-place edit. Duplication costs tokens and inflates that meaning's rank on the ladder.
- **The environment is a source of truth too** (`package.json` scripts, config, directory layout, `--help`). Restating it is a cache; cache only what a lookup cannot find: the unwritten convention, the reason behind a choice, the gotcha no config confesses.
- **The no-op test**, sentence by sentence: delete it and ask whether behaviour changes against the model's default. If not, delete the whole sentence rather than trimming words. A leading word too weak to beat the default (*be thorough*) fails the same test; the fix is a stronger word.
- **Relevance**: when the behaviour or the world changes, re-check every line. Stale layers settle as **sediment** because adding feels safe and removing feels risky.
- **Generalise from the run**: a document written up from one task overfits it. Keep the run as evidence, then strip what belonged to that repo and those files.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "The agent needs background to understand" | It has read more than you have. Explain only what it cannot look up: conventions, reasons, gotchas. |
| "The template has a section for it, so I'll fill it" | A required section still has to change behaviour. Write the shortest version that clears its bar. |
| "Saying it twice makes it stick" | Duplication drifts and distorts rank. Repeat a leading word, never the meaning. |
| "I'll list everything it must not do" | Each ban primes the banned behaviour. State the target behaviour instead. |
| "The linter passed, so the skill is done" | The linter checks shape. The no-op pass and a real run check behaviour. |

## Verification

- [ ] Every always-loaded pointer names its branches, one trigger each, with the condition in the wording.
- [ ] Every step ends on a checkable completion criterion.
- [ ] Material that only some branches need sits behind a pointer.
- [ ] The no-op pass ran sentence by sentence, and no meaning is stated twice.
- [ ] Every remaining prohibition is paired with its positive target.
- [ ] For a skill: `node scripts/lint-skill.js <skill-dir>` (run from this skill's directory) exits 0, and the review checks in [references/skill-structure.md](references/skill-structure.md) pass.
- [ ] The document ran on a real task and the agent behaved as intended.
