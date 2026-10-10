# Command

## Problem

A request has to exist as a value: queued, logged, retried, scheduled, undone or sent elsewhere, instead of being a method call that happens and disappears.

## Use when

- Requests are queued or scheduled to run later
- An action must be undoable, audited, or replayed
- Several entry points (HTTP, CLI, a queue consumer) trigger the same operations

## Skip when

- The action runs once, now, from one entry point → call the function.

## Shape

```ts
type Command =
  | { type: 'SchedulePrice'; variantId: VariantId; amount: Money; startsAt: string }
  | { type: 'DiscontinueVariant'; variantId: VariantId };

type Handler<C extends Command> = (cmd: C) => Promise<void>;

const handlers: { [K in Command['type']]: Handler<Extract<Command, { type: K }>> } = {
  SchedulePrice: cmd => schedulePrice.run(cmd),
  DiscontinueVariant: cmd => discontinueVariant.run(cmd),
};

async function dispatch(cmd: Command) {
  await audit.record(cmd);                              // the value can be logged, queued or retried
  await (handlers[cmd.type] as Handler<Command>)(cmd);
}
```

## Rules

- **Commands are serialisable data** with an imperative name (`SchedulePrice`); behaviour lives in handlers.
- **One handler per command type**, and the handler map is exhaustive.
- **Retried commands are idempotent**: a command that can be redelivered carries an id the handler uses to detect repeats.
- **Undo is its own command** (or a stored inverse), never a reversal of side effects already sent outside.

## Misuse signs

- A command object holding service references or functions
- A command bus in front of operations that are only ever called directly
- A retried command with no id to detect duplicates
