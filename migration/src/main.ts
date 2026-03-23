// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Interactions } from "./interactions";

// TODO Refaktoriere Flow Design
// TODO Definiere Provider
// TODO Beachte IOSP: Integration vs. Operation
// TODO Erstelle IODA Architektur
// TODO Führe Migration in main-Prozess aus?

const interactions = new Interactions(
  "data/input/legacy.sqlite",
  "data/output/naturheilpraxis.sqlite",
);

interactions.migriereDatenbank();
