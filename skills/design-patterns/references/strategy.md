# Strategy

## Problem

One job can be done several interchangeable ways, chosen at runtime, and a growing `if`/`switch` over the choice is spreading or getting long.

## Use when

- The variants share one signature and differ only in how they compute (pricing rules, tax per country, export formats)
- New variants are expected, or tenants and config pick the variant

## Skip when

- There are two variants and one call site → an `if`.
- The choice depends on a lifecycle state that changes as the object is used → State (see the index).
- The variants share most steps and differ in a few → Template Method (see the index).

## Shape

```ts
interface ShippingCost {
  quote(order: Order): Money;
}

const flatRate: ShippingCost = { quote: () => money(500) };
const byWeight: ShippingCost = { quote: o => money(o.weightGrams * 2) };

const strategies: Record<ShippingMethod, ShippingCost> = { flat: flatRate, weight: byWeight };

function checkout(order: Order, method: ShippingMethod) {
  const shipping = strategies[method].quote(order);   // caller knows the interface, not the variant
  // …
}
```

## Rules

- **One interface** every variant implements fully; the caller depends only on it.
- **Choose in one place**: a map or factory selects the strategy; no other code branches on the choice.
- **A function is enough** when the strategy has one method and no state.
- **Each variant is tested alone** against the interface's contract.

## Misuse signs

- The same `switch` on the method still present in other files
- A strategy interface with a single implementation and no second one in the spec
- Variants checking `instanceof` or flags to tell each other apart
