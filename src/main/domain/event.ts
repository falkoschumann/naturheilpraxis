// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { CloudEventV1 } from "cloudevents";

export type Event<T = unknown> = CloudEventV1<T> & {
  data: T;
  position?: SequencePosition;
  tags?: string[];
};

export type SequencePosition = number;
