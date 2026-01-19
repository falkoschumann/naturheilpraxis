// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { CloudEventV1 } from "cloudevents";

export type Event<T = unknown> = CloudEventV1<T> & { tags?: string[] };

/**
 * Event Store Interface
 *
 * @see https://dcb.events/specification/
 */
export interface EventStore<T = unknown> {
  replay(
    query: Query,
    options?: ReadOptions,
  ): AsyncGenerator<SequencedEvent<T>>;

  record(
    events: Iterable<Event<T>> | Event<T>,
    condition?: AppendCondition,
  ): Promise<void>;
}

export class Query {
  static fromItems(items: QueryItem[]) {
    return new Query(items);
  }

  static all() {
    return new Query([]);
  }

  readonly items: QueryItem[];

  constructor(items: QueryItem[]) {
    this.items = items;
  }
}

export interface QueryItem {
  readonly types?: string[];
  readonly tags?: string[];
}

export interface ReadOptions {
  readonly start: SequencePosition;
  readonly limit?: number;
}

export class SequencedEvent<T = unknown> {
  readonly event: Event<T>;
  readonly position: SequencePosition;

  constructor(event: Event<T>, position: SequencePosition) {
    this.event = event;
    this.position = position;
  }
}

export type SequencePosition = number;

export interface AppendCondition {
  readonly failIfEventsMatch: Query;
  readonly after?: SequencePosition;
}
