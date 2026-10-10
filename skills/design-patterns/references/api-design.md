# API design

Adapted from `api-and-interface-design` in [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) (MIT).

## Problem

Other code depends on this interface. Every behaviour a caller can observe (field names, error text, ordering, timing) becomes a contract the moment someone relies on it, documented or not (Hyrum's Law).

## Use when

- Adding or changing an HTTP endpoint, an event payload, a module's exported functions or a component's props
- Another team or service will call it

## Skip when

- A function is private to one module and called from one place → plain code; let its tests be the contract.

## Shape

```ts
// The contract comes first; the implementation follows it.
interface TaskApi {
  createTask(input: CreateTaskInput): Promise<Task>;                  // returns server-generated fields
  listTasks(q: ListTasksQuery): Promise<Page<Task>>;                  // always paginated
  getTask(id: TaskId): Promise<Task>;                                 // throws NotFound
  updateTask(id: TaskId, patch: Partial<CreateTaskInput>): Promise<Task>;
}

type TaskId = string & { readonly __brand: 'TaskId' };                // a UserId can't pass as a TaskId
interface CreateTaskInput { title: string; description?: string }    // what the caller sends
interface Task { id: TaskId; title: string; description: string | null; createdAt: string } // what it gets back
type TaskStatus =
  | { type: 'pending' }
  | { type: 'done'; completedAt: string };                           // variants as a discriminated union
```

## Rules

- **Contract first**: write the types or schema before the handler, and commit them with it.
- **Expose on purpose**: return only fields a caller needs; internal ids, stack traces and storage shapes stay inside.
- **One error format** across every endpoint, with a stable machine-readable code per failure and the status codes used for one meaning each (400 malformed, 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict, 422 invalid). 500s carry no internals.
- **Validate at the boundary**: request bodies, query strings, environment variables and every third-party response are parsed against a schema where they enter. Code behind the boundary trusts the types.
- **Additive change**: new fields are optional; existing fields keep their name and type. A breaking change goes expand–contract (new form beside the old, callers migrated, old form removed), with one live version at a time.
- **Consistent naming**, following the repo's existing convention. Without one: plural nouns for REST resources with no verbs in paths, camelCase fields, `is`/`has`/`can` booleans.
- **REST shape**: `GET/POST /tasks`, `GET/PATCH/DELETE /tasks/:id`, sub-resources as `/tasks/:id/comments`; filters in query params; PATCH applies only the fields sent.
- **Every list is paginated** from the first version, and the response carries the paging state.
- **Input and output types are separate**: the input holds what the caller provides, the output adds server-generated fields.

### Idempotency keys

A state-changing endpoint either honours an `Idempotency-Key` or is documented as unsafe to retry.

- **Key from the intent**: the client sends one key per intent and reuses it on retry, or the key derives from an immutable id (`charge:v1:${orderId}`). A UUID, timestamp or anything regenerated per attempt makes every retry a new effect.
- **Claim atomically**: insert the key under a unique constraint before doing the effect, and treat a unique violation as "seen". A read followed by an insert is a race.
- **Guard the payload**: store a hash of the request; the same key with a different body fails with 422.
- **Choose the in-flight answer**: a duplicate arriving while the first is running gets 409, a bounded wait, or 202 with a status URL. Pick one deliberately.
- **Three outcomes**: a timeout means *unknown*, not failure. Record the intent before calling out.
- **Retention outlives the longest retry path**, including dead-letter replays.

## Misuse signs

- One endpoint returning different shapes depending on conditions
- Two error formats in the same API
- Validation repeated in internal functions, or missing on a third-party response
- A field renamed, removed or retyped in place
- A list endpoint with no pagination
- A verb in a REST path (`/createTask`)
- An idempotency key checked with `SELECT` then written with `INSERT`, or built from a UUID or timestamp
