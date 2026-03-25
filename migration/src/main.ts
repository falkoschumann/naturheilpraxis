// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Interactions } from "./interactions";

const interactions = Interactions.create({
  legacyDatabasePath: "data/input/legacy.sqlite",
  databasePath: "data/output/naturheilpraxis.sqlite",
});

interactions.migriereDatenbank();
