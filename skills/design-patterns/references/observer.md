# Observer

## Problem

Several parts must react when something changes, and the source of the change should not know or call each of them, or every new reaction means editing the source.

## Use when

- A domain event has more than one independent reaction (send email, update a read model, audit)
- Reactions belong to other modules that the source must not depend on

## Skip when

- There is one reaction and it is part of the same use case → call it directly.
- Reactions must survive a crash or run in another service → a durable queue or outbox, which is a separate decision for the spec.

## Shape

```ts
type PriceScheduled = { type: 'PriceScheduled'; variantId: VariantId; startsAt: string };
type DomainEvent = PriceScheduled /* | … */;

class EventBus {
  private handlers = new Map<DomainEvent['type'], Array<(e: DomainEvent) => Promise<void>>>();

  on<T extends DomainEvent['type']>(type: T, h: (e: Extract<DomainEvent, { type: T }>) => Promise<void>) {
    this.handlers.set(type, [...(this.handlers.get(type) ?? []), h as (e: DomainEvent) => Promise<void>]);
  }

  async publish(e: DomainEvent) {
    for (const h of this.handlers.get(e.type) ?? []) await h(e);
  }
}

bus.on('PriceScheduled', e => audit.record(e));          // subscribers register at the composition root
```

## Rules

- **Events are past-tense facts** in domain terms (`PriceScheduled`), carrying the data reactions need.
- **The source publishes and moves on**; it never inspects who listens.
- **Subscribe at the composition root**, so the wiring is in one place.
- **Decide failure behaviour**: whether a failing handler fails the publisher or is logged and skipped is written in the spec.
- **Test each handler alone**, and test once that the source publishes the event.

## Misuse signs

- A handler whose failure silently loses work the spec says must happen
- Event chains (handler publishes, which triggers a handler, which publishes…) that only make sense read together
- An event bus with one event and one handler
- Subscribers registered inside domain objects
