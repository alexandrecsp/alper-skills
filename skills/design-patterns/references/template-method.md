# Template Method

## Problem

Several procedures run the same steps in the same order and differ in a few of them, and the shared sequence is copied into each one.

## Use when

- Importers, exporters, report builders or sync jobs that share load → validate → transform → write and differ in one or two steps
- The order of steps is a rule that every variant must follow

## Skip when

- The variants differ in the whole computation, not in steps → Strategy (see the index).
- Two procedures share two lines → extract a function.

## Shape

```ts
// The sequence lives in one function; the varying steps are passed in.
interface ImportSteps<Row> {
  parse(file: Buffer): Row[];
  toEntry(row: Row): CatalogEntry;
}

async function runImport<Row>(file: Buffer, steps: ImportSteps<Row>, repo: EntryRepository) {
  const rows = steps.parse(file);
  const entries = rows.map(steps.toEntry);
  const invalid = entries.filter(e => !e.isValid());
  if (invalid.length) throw new ImportRejected(invalid);   // shared rule: all or nothing
  await repo.saveAll(entries);
}

await runImport(csv, csvSteps, repo);
await runImport(xlsx, excelSteps, repo);
```

The classic form uses an abstract base class with `protected abstract` steps; prefer the function-and-steps form above unless the repo already uses base classes.

## Rules

- **The sequence is written once** and is the only place that orders the steps.
- **Varying steps are small and named**; each variant supplies only those.
- **Shared rules live in the template** (validation, transactions, logging), never in the steps.
- **Test the template once** with fake steps, and each variant's steps on their own.

## Misuse signs

- A variant that reorders or skips the template's steps through flags
- Steps that call back into the template
- A template with one variant
