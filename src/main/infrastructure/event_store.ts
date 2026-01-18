// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

/**
 * Event Store Interface
 *
 * @see https://dcb.events/specification/
 */
export interface EventStore<E extends Event> {
  read(query: Query, options?: ReadOptions): AsyncGenerator<SequencedEvent<E>>;

  append(events: Iterable<E> | E, condition?: AppendCondition): Promise<void>;
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

export class SequencedEvent<E extends Event> {
  readonly event: E;
  readonly position: SequencePosition;

  constructor(event: E, position: SequencePosition) {
    this.event = event;
    this.position = position;
  }
}

export type SequencePosition = number;

export interface Event<T = unknown> {
  readonly type: string;
  readonly data: T;
  readonly tags?: string[];
}

export interface AppendCondition {
  readonly failIfEventsMatch: Query;
  readonly after?: SequencePosition;
}
