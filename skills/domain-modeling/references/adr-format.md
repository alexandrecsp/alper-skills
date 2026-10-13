# ADR format

Back to [the skill](../SKILL.md).

ADRs live in `.sdd/docs/adr/`, numbered `0001-<slug>.md`, `0002-<slug>.md`: scan for the highest number and add one. Create the directory with the first ADR.

```markdown
# <Short title of the decision>

<One to three sentences: the context, what was decided, and why.>
```

A single paragraph is a complete ADR. Add a section only when it carries something a reader needs:

- **Status** frontmatter (`proposed | accepted | deprecated | superseded by ADR-NNNN`) when the decision may be revisited.
- **Considered options** when a rejected alternative would otherwise be suggested again.
- **Consequences** when a downstream effect is not obvious.

## What usually qualifies

- Architectural shape: "the write model is event-sourced; reads are projected into Postgres."
- Integration between contexts: "Ordering and Billing talk through events, not HTTP."
- Technology with lock-in: the database, the message bus, the auth provider.
- Boundaries: "Customer data is owned by Customer; other contexts hold its ID only."
- Deliberate deviations: "raw SQL instead of the ORM, because …".
- Constraints the code cannot show: compliance, a partner's latency contract.
