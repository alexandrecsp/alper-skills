# Decorator

## Problem

You need to add behaviour around an object (caching, retry, logging, metrics, authorization) without editing it, and without every caller adding the behaviour itself.

## Use when

- A cross-cutting concern applies to some implementations of an interface, or only in some environments
- Concerns should combine in different orders or subsets

## Skip when

- The behaviour belongs to the object's own job → put it in the object.
- The framework already offers the hook (NestJS interceptors, Express middleware) → use the hook.
- The interfaces differ → Adapter (see the index).

## Shape

```ts
interface VariantReader {
  bySku(sku: Sku): Promise<Variant | null>;
}

class CachedVariantReader implements VariantReader {
  constructor(private inner: VariantReader, private cache: Cache, private ttlMs: number) {}

  async bySku(sku: Sku) {
    const hit = await this.cache.get<Variant>(sku);
    if (hit) return hit;
    const v = await this.inner.bySku(sku);
    if (v) await this.cache.set(sku, v, this.ttlMs);
    return v;
  }
}

const reader: VariantReader = new CachedVariantReader(new SqlVariantReader(db), cache, 60_000);
```

## Rules

- **Same interface in and out**: a decorator implements exactly the interface it wraps.
- **One concern per decorator**, composed at the composition root.
- **Transparent**: callers cannot tell whether they hold a decorated object.
- **Test the decorator** with a fake inner object, covering pass-through and the added behaviour.

## Misuse signs

- A decorator that changes results or method signatures
- Callers checking whether they got the cached or uncached version
- Several concerns (cache and retry and logging) in one wrapper class
