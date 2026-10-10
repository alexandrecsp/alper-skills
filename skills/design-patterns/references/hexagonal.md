# Hexagonal (ports and adapters)

## Problem

Domain rules tangled with the database, HTTP or a framework can only be tested through them, and change whenever the infrastructure does.

## Use when

- The domain has rules worth testing on their own (lifecycles, invariants, calculations)
- The feature talks to infrastructure that tests should replace: a database, a queue, a clock, a third-party API

## Skip when

- The module is a thin pass-through: CRUD with no rules, a proxy, a report query → a plain handler calling the data layer.
- The repo already layers its code another way (for example NestJS modules with services and repositories) → follow that layering; put the rules in its service layer.

## Shape

```ts
// domain/ — no imports from infrastructure or framework
export class Price {
  static schedule(amount: Money, period: Period, existing: Price[]): Price {
    if (existing.some(p => p.period.overlaps(period))) throw new OverlappingPeriod();
    return new Price(amount, period);
  }
}

// application/ — use cases and the ports they need, owned by the inside
export interface PriceRepository {                           // driven (outbound) port
  forVariant(id: VariantId): Promise<Price[]>;
  save(id: VariantId, price: Price): Promise<void>;
}
export class SchedulePrice {                                // driving (inbound) port: the use case
  constructor(private prices: PriceRepository, private clock: Clock) {}
  async run(cmd: SchedulePriceInput): Promise<void> { /* load, apply domain rule, save */ }
}

// adapters/ — the outside, implementing or calling the ports
class PostgresPriceRepository implements PriceRepository { /* SQL */ }
router.post('/variants/:id/prices', (req, res) => schedulePrice.run(parse(req)));  // HTTP adapter
```

## Rules

- **Dependencies point inward**: adapters import application and domain; domain imports nothing outside itself.
- **Ports belong to the inside**: an interface is shaped by what the use case needs, named in domain terms, not by what the database offers.
- **One use case per driving port**, taking validated input and returning domain results; HTTP status codes and SQL errors stay in adapters.
- **Wire at the edge**: one composition root constructs adapters and injects them.
- **Test seams**: domain and use cases are tested with in-memory adapters; each real adapter gets its own integration test against the real infrastructure.

## Misuse signs

- A domain or application file importing an ORM, HTTP framework or SDK
- A port named after a technology (`PostgresPort`) or returning ORM entities
- A use case that reads `req` or returns a status code
- Ports and adapters for a module with no rules, adding layers that only delegate
