// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Interactions } from "./interactions";

const interactions = new Interactions(
  "data/input/legacy.sqlite",
  "data/output/einstellungen.json",
  "data/output/event-log.ndjson",
);
await interactions.createEinstellungen();
await interactions.createEventLog();
interactions.close();
