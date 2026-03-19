// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Interactions } from "./interactions";

// FIXME Migrate legacy database

const interactions = new Interactions(
  "data/input/legacy.sqlite",
  "data/output/naturheilpraxis.sqlite",
);

interactions.migriereEinstellungen();
interactions.migrierePatienten();
interactions.dispose();
