# State

## Problem

An object's allowed actions depend on its lifecycle state, and the transitions have rules. Checks like `if (status === 'draft')` scattered across methods drift apart and let illegal transitions through.

## Use when

- The domain defines states and allowed moves between them (draft → active → discontinued, order lifecycles, approvals)
- Several operations behave differently per state

## Skip when

- Only one operation varies by state → a guard at its start.
- The states have no rules between them, only labels → an enum field.

## Shape

```ts
type VariantState = 'draft' | 'active' | 'discontinued';

const transitions: Record<VariantState, readonly VariantState[]> = {
  draft: ['active'],
  active: ['discontinued'],
  discontinued: [],
};

class Variant {
  constructor(private state: VariantState) {}

  moveTo(next: VariantState): void {
    if (!transitions[this.state].includes(next)) throw new IllegalTransition(this.state, next);
    this.state = next;
  }

  get orderable(): boolean { return this.state === 'active'; }
}
```

When behaviour per state grows past a few rules, give each state its own class implementing one interface, and let the context delegate to the current one.

## Rules

- **One transition table** (or one class per state) is the only place that says which moves are allowed.
- **Transitions are methods** on the owner (`activate()`, `moveTo()`); nothing assigns the state field directly.
- **Illegal transitions fail loudly** with a domain error naming both states.
- **Every edge is tested**: each allowed move succeeds, and each disallowed move from each state is rejected.

## Misuse signs

- `state = 'active'` written outside the owning class
- The same status check repeated in several services
- A transition table that differs from the spec's lifecycle
- State classes for an object with two states and no behaviour difference
