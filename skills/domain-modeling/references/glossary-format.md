# GLOSSARY.md format

Back to [the skill](../SKILL.md).

```markdown
# <Context name>

<One or two sentences: what this context is and why it exists.>

## Language

**Order**:
A customer's request to buy one or more products.
_Avoid_: purchase, transaction

**Invoice**:
A request for payment sent to a customer after delivery.
_Avoid_: bill, payment request
```

- **Be opinionated.** When several words name one concept, pick one and list the rest under `_Avoid_`.
- **One or two sentences per term.** Define what it is, not what it does or how it is built.
- **Only this project's concepts.** General programming terms (timeout, retry, cache) stay out even when the code uses them heavily.
- **Group under subheadings** when clusters emerge; a flat list is fine otherwise.

## Several contexts

A large repo with independent areas keeps one glossary per context in `.sdd/glossaries/<context>.md`, and `.sdd/GLOSSARY-MAP.md` in place of `.sdd/GLOSSARY.md`:

```markdown
# Glossary Map

## Contexts

- [Ordering](glossaries/ordering.md): receives and tracks customer orders
- [Billing](glossaries/billing.md): generates invoices and takes payments

## Relationships

- **Ordering → Billing**: Ordering emits `OrderPlaced`; Billing consumes it to invoice.
```
