# Factory Method

## Problem

Code needs an object but must not know which concrete type to create, because the choice depends on input, config or environment, and construction logic is being repeated at each call site.

## Use when

- Several concrete types share an interface and the type is decided by data (a payload's `type`, a tenant setting, an environment)
- Construction needs rules (validation, defaults, wiring) that every caller would otherwise repeat

## Skip when

- There is one concrete type → call its constructor.
- Dependency injection in the repo already decides which implementation is used → register it there.

## Shape

```ts
interface Notifier { send(to: string, body: string): Promise<void> }

class EmailNotifier implements Notifier { /* … */ }
class SmsNotifier implements Notifier { /* … */ }

function createNotifier(channel: Channel, config: Config): Notifier {
  switch (channel) {
    case 'email': return new EmailNotifier(config.smtp);
    case 'sms':   return new SmsNotifier(config.smsApiKey);
  }
}

// callers depend on Notifier only
await createNotifier(user.preferredChannel, config).send(user.contact, message);
```

## Rules

- **Return the interface**, never a concrete type.
- **One factory per family**: it is the only place that names the concrete classes.
- **Exhaustive choice**: the type switch covers every case so the compiler flags a new one.
- **Static factory methods** (`Price.schedule(...)`) are the same pattern for one class whose construction has rules; prefer them over public constructors that accept invalid state.

## Misuse signs

- `new ConcreteType(...)` for the family still appearing outside the factory
- A factory that only ever returns one type
- Factories of factories with no second level of variation in the spec
