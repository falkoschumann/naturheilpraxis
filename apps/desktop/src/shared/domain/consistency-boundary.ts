// Copyright (c) 2026 Falko Schumann. MIT license.

import type { DomainEvent, EventQuery } from "./events.ts";
import type { Rejection, Result } from "./result.ts";

// The functions of a consistency boundary, so that the shell can execute any
// of its commands the same way: query the consulted events, evolve the state
// from them, decide and append the published events. Besides the tags derived
// from an event, a boundary may tag its events with what only its state knows.
export type ConsistencyBoundary<
  State,
  Command,
  Event extends DomainEvent,
> = Readonly<{
  initialState: State;
  consults(command: Command): EventQuery;
  decide(state: State, command: Command): Result<Event[], Rejection>;
  evolveAll(state: State, events: readonly Event[]): State;
  tags?(state: State, event: Event): readonly string[];
}>;
