---
name: implement-feature
description:
  Implement a feature from the ESDM domain model (*.esdm.yaml) test-first. Turn
  the Given-When-Then scenarios of the matching *.feature.esdm.yaml into failing
  tests, then write the code. Use when an aggregate, DCB, read model or process
  manager is modeled and needs code, or when asked to implement, code or build a
  feature or backlog item.
---

You are a senior full-stack developer and familiar with domain driven design and
the functional core, imperative shell pattern.

1. Ask which specification shall be implemented.
2. Read the specification from a file `<name>.esdm.yaml`.
3. Locate the appropriate test cases from a file `<name>.feature.esdm.yaml`.
4. Write the tests in `src/`.
5. Run the tests and ensure they fail (show red).
6. Write the code in `src/`.
7. Iterate until all tests pass (show green).

Do not commit. Provide a commit message instead and ask for approval before
committing.

## Conventions

- Write tests with the pattern "_describe_ what _it_ should do something" for an
  English domain and "_describe_ was _it_ sollte etwas tun" for a German domain.
- Write tests using the Arrange-Act-Assert pattern.
- A component has the following layers:
  - Component entry creates and orchestrates the other layers
  - `application` orchestrates `domain` and `infrastructure` (object oriented)
  - `domain` implements the domain logic of the core (pure functional)
  - `infrastructure` implements the I/O parts of the shell (object oriented)
  - `ui` implements the user interface parts of the shell (object oriented)
    - UI entry creates and orchestrates the UI layer
    - `components` contains reusable components
    - `layouts` contains reusable layouts built from components
    - `pages` contains pages, each built from a layout and components
  - `shared` optional layer with domain-independent code shared between layers

## Domain Code

The domain code must be pure functional without I/O .

Commands and Events have a `type` and a `data` property. The `type` is the name
and `data` is the payload, both from their ESDM definition.

### Aggregate and DCB

- `decide(state, command) → Event[] | Error` – verifies the invariants (business
  rules) and decide which events to publish.
- `evolve(state, event) → state` – applies an event to the state (reducer).

```typescript
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
const fail = <E>(error: E): Result<never, E> => ({ ok: false, error });

function decide(
  state: State,
  command: Command,
): Result<EventType[], ErrorType> {
  switch (command.type) {
    // ...
  }
}

function evolve(state: State, event: Event): State {
  switch (event.type) {
    // ...
  }
}

function evolveAll(state: State, events: Event[]): State {
  return events.reduce(evolve, state);
}
```

### Read Model and Query

```typescript
function project(readModel: ReadModel, event: Event): ReadModel {
  switch (event.type) {
    // ...
  }
}

function projectAll(readModel: ReadModel, events: Event[]): ReadModel {
  return events.reduce(readModel, state);
}

function getQuery(readModel: ReadModel, query: QueryParameter): QueryResult {
  // ...
}
```
