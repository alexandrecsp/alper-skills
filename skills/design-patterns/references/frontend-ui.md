# Frontend UI

Adapted from `frontend-ui-engineering` in [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) (MIT).

## Problem

UI is code people see and operate. It has to work with a keyboard and a screen reader, at every width, in every data state, and look like the product's design system rather than a generic generated page.

## Use when

- Building or changing a component, page or layout
- Adding client state or a data-loading flow

## Skip when

- The change is a backend-only behaviour behind an unchanged UI → API design (see the index).

## Shape

```tsx
// Container: owns data and the states. Presentation: renders what it is given.
export function TaskListContainer() {
  const { tasks, isLoading, error, refetch } = useTasks();
  if (isLoading) return <TaskListSkeleton />;
  if (error) return <ErrorState message="Couldn't load tasks" onRetry={refetch} />;
  if (tasks.length === 0) return <EmptyState message="No tasks yet" action={<CreateTaskButton />} />;
  return <TaskList tasks={tasks} />;
}

export function TaskList({ tasks }: { tasks: Task[] }) {
  return <ul role="list">{tasks.map(t => <TaskItem key={t.id} task={t} />)}</ul>;
}

// Composition over configuration
<Card><CardHeader><CardTitle>Tasks</CardTitle></CardHeader><CardBody>…</CardBody></Card>
```

## Rules

- **Container and presentation**: data fetching and state live in a container or hook; presentational components take props and render. A component stays focused on one job.
- **Composition over configuration**: build from small composable parts instead of one component with many layout props.
- **Every data state**: loading (a skeleton for content), empty (with the next action), error (with a retry), success, and permission-denied where it applies.
- **The simplest state that works**, in this order: local state, lifted state, URL state for filters and paging, a server-state cache for remote data, context for read-mostly app values (theme, auth, locale), a global store last. Props passed through more than three components that don't use them call for context or a new structure.
- **Optimistic updates roll back**: a mutation shown before the server confirms restores the previous state on error.
- **Design system first**: colours, spacing, radii, shadows and type come from the project's tokens and scale. With no design system, use a consistent scale and the product's existing screens as the reference.
- **The product's own look**: real content in place of lorem ipsum, layouts ordered by what the user needs first, and the project's palette. The generated-UI defaults (indigo everywhere, heavy gradients, maximum rounding, deep shadows, uniform card grids, generous padding on everything) appear only where the design system asks for them.
- **Accessible to WCAG 2.1 AA**:
  - Native interactive elements (`<button>`, `<a>`, `<input>`) for anything clickable.
  - Every control has an accessible name: a visible `<label>`, or `aria-label` when there is no visible text.
  - Focus moves into opened dialogs, stays trapped while open, and returns on close.
  - Text contrast at least 4.5:1 (3:1 for large text); state is shown by text or icon as well as colour.
  - Heading levels run in order, one `h1` per page.
- **Responsive, mobile first**: base styles for the narrowest screen, then widen; check 320, 768, 1024 and 1440 px.
- **Colocate**: a component's implementation, tests, stories and hook sit in one folder.

The sketches use React; apply the same rules in the repo's framework.

## Misuse signs

- A clickable `<div>` or `<span>`
- An icon-only button with no accessible name
- A list with no empty state, or a fetch with no error state
- Raw hex colours or off-scale pixel values where tokens exist
- A component over about 200 lines mixing fetching and rendering
- Red/green as the only signal of a state
- A global store holding state one component uses
