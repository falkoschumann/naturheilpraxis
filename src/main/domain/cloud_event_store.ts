// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { CloudEventV1 } from "cloudevents";

import type { EventStore } from "./event_store";

export interface CloudEventV1WithData<E = unknown> extends CloudEventV1<E> {
  data: E;
}

export type CloudEventStore<E = unknown> = EventStore<CloudEventV1WithData<E>>;
