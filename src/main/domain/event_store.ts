// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { CloudEventV1 } from "cloudevents";

export type Event<T = unknown> = CloudEventV1<T> & {
  data: T;
  position?: SequencePosition;
  tags?: string[];
};

export type SequencePosition = number;

/**
 * Event Store Interface
 *
 * @see https://dcb.events/specification/
 */
export interface EventStore<T = unknown> {
  replay<E extends Event<T>>(
    query: Query,
    options?: ReadOptions,
  ): AsyncGenerator<E>;

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

export interface AppendCondition {
  readonly failIfEventsMatch: Query;
  readonly after?: SequencePosition;
}
