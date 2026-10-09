---
name: domain-modeling
description: Keeps a project's GLOSSARY.md and ADRs in step with decisions as they are made. Use when a domain term is introduced, conflicts with the glossary, or gets sharpened, or when a decision may deserve an ADR.
metadata:
  type: process
---

# Domain Modeling

## Overview

Writes the domain language down the moment a term is settled, and records a decision as an ADR only when it is hard to reverse, surprising, and the result of a real trade-off. `GLOSSARY.md` holds language only, never implementation.

## When to Use

- **A term is new, fuzzy, or used differently from `GLOSSARY.md`** → run steps 1–3.
- **A decision might deserve an ADR** → run step 4.
- **`setup-repository` is seeding a glossary** → run steps 1–3 on the terms it proposes.

## Process

### 1. Find the glossary

`GLOSSARY-MAP.md` at the root means several contexts: read it and pick the context the term belongs to. Otherwise use the root `GLOSSARY.md`, created when the first term is settled. Format: [glossary-format](references/glossary-format.md).

Done when: you know which `GLOSSARY.md` the term belongs in.

### 2. Challenge the term

- **Conflicts with the glossary** → name the conflict: "the glossary defines *cancellation* as X, but this uses it as Y; which is it?"
- **Fuzzy or overloaded** → propose one precise term: "*account* here: the Customer or the User?"
- **Contradicts the code** → name the contradiction: "the code cancels whole Orders, but this allows partial cancellation."

Put the question to the user. When you are a subagent and cannot reach the user, return it to your caller with your recommended answer.

Done when: the term has one meaning the user chose or the decisions already fix.

### 3. Write the term

Add or update the entry, then use that term everywhere you write next.

Done when: the entry is in the glossary in the format, and nothing you wrote uses an `_Avoid_` synonym.

### 4. Record an ADR when all three hold

1. **Hard to reverse**: changing course later costs real work.
2. **Surprising without context**: a future reader would ask "why on earth?".
3. **A real trade-off**: there were genuine alternatives.

If all three hold, write the ADR in `docs/adr/` using [adr-format](references/adr-format.md). If any is missing, skip it.

Done when: every decision that meets all three has an ADR, and no other decision has one.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I'll collect the terms and update the glossary at the end" | Terms drift within one session. Write each when it is settled. |
| "The glossary should explain how it works" | Implementation goes stale; language does not. Define what the term is. |
| "An ADR is cheap, record it anyway" | ADRs nobody needs bury the ones that matter. Write one only when all three conditions hold. |

## Red Flags

- Two words used for one concept in the same document (step 3)
- A glossary entry that names a function, table or file (step 3)
- A term changed without asking whoever owns the decision (step 2)
- An ADR for a decision that is easy to reverse or unsurprising (step 4)

## Verification

- [ ] Every settled term is in the right `GLOSSARY.md`, in the format, with `_Avoid_` synonyms listed.
- [ ] No glossary entry contains implementation detail.
- [ ] Every conflict with the glossary or the code was put to the user or returned to the caller.
- [ ] Every ADR written meets all three conditions.
