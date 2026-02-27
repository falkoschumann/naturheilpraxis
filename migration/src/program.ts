// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Interactions } from "./interactions";

const interactions = new Interactions(
  "data/input/legacy.sqlite",
  "data/output/event-log.ndjson",
);

const settings = await interactions.createSettings();
interactions.createDatabase(settings);
interactions.dispose();
