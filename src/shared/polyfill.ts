// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal as TemporalPolyfill } from "@js-temporal/polyfill";

if (typeof globalThis.Temporal === "undefined") {
  globalThis.Temporal = TemporalPolyfill;
}
