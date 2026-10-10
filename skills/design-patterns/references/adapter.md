# Adapter

## Problem

An existing interface (a third-party SDK, a legacy module, another service's API) does not match the one your code expects, and its shape is leaking into code that should not know it.

## Use when

- Wrapping a vendor SDK or external API behind your own interface
- Calling a legacy module whose names, types or errors differ from the domain's
- Implementing a driven port in hexagonal (see the index): every real port implementation is an adapter

## Skip when

- The external interface already matches yours → call it directly.
- You need to add behaviour around an object with the same interface → Decorator (see the index).

## Shape

```ts
// What our code wants
interface PaymentGateway {
  charge(amount: Money, card: CardToken): Promise<ChargeResult>;
}

// What the vendor offers: different names, units and errors
class StripePaymentGateway implements PaymentGateway {
  constructor(private stripe: Stripe) {}

  async charge(amount: Money, card: CardToken): Promise<ChargeResult> {
    try {
      const pi = await this.stripe.paymentIntents.create({ amount: amount.cents, currency: amount.currency, payment_method: card });
      return { ok: true, reference: pi.id };
    } catch (e) {
      return { ok: false, reason: toDomainReason(e) };     // vendor errors never cross the boundary
    }
  }
}
```

## Rules

- **The target interface is yours**, named in domain terms; the adaptee's types appear only inside the adapter.
- **Translate everything**: names, units, ids, errors and nulls are converted at the adapter.
- **Validate what comes back**: an external response is untrusted input and is parsed before use.
- **Integration-test the adapter** against the real service or its sandbox; unit tests of callers use a fake of the target interface.

## Misuse signs

- Vendor types or error classes imported outside the adapter
- An adapter that passes the vendor object through unchanged
- Callers catching vendor-specific exceptions
