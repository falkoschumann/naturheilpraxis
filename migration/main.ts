// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Interactions } from "./interactions.ts";

const interactions = new Interactions(
  "data/legacy.sqlite",
  "data/einstellungen.json",
);
interactions.createConfiguration();
interactions.close();
