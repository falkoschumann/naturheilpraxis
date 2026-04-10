// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Temporal as TemporalPolyfill } from "@js-temporal/polyfill";

declare global {
  namespace Temporal {
    export type PlainDate = TemporalPolyfill.PlainDate;
    export type ZonedDateTime = TemporalPolyfill.ZonedDateTime;
    export type PlainTime = TemporalPolyfill.PlainTime;
    export type PlainYearMonth = TemporalPolyfill.PlainYearMonth;
    export type PlainMonthDay = TemporalPolyfill.PlainMonthDay;
    export type Duration = TemporalPolyfill.Duration;
    export type Instant = TemporalPolyfill.Instant;
    export type TimeZone = TemporalPolyfill.TimeZone;
    export type Calendar = TemporalPolyfill.Calendar;
  }

  var Temporal: typeof TemporalPolyfill;
}

export {};
