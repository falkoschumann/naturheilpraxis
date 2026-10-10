// Copyright (c) 2026 Falko Schumann. MIT license.

// Migrates the data of the legacy application once into a new, empty event
// store:
//
//   node src/main/migrate.ts <legacy.sqlite> <praxen.json> <naturheilpraxis.db>
//
// The legacy database knows the Praxen only as agencies with a name, so their
// data is given as a JSON array like
//
//   [{ "agencyId": 5, "praxis": { "praxiskuerzel": "NHP", ... } }, ...]
//
// The first Praxis is the main Praxis, which takes the Patienten no other Praxis
// can be derived for. Agencies without a Praxis are no Praxis.

import fs from "node:fs";

import {
  migrateLegacyData,
  migrationTags,
  type LegacyPraxis,
} from "./domain/legacy-migration.ts";
import { SqliteEventStore } from "./infrastructure/event-store.ts";
import { LegacyDatabase } from "./infrastructure/legacy-database.ts";

function main(args: readonly string[]): number {
  const [legacyFile, praxenFile, eventStoreFile] = args;
  if (
    legacyFile === undefined ||
    praxenFile === undefined ||
    eventStoreFile === undefined
  ) {
    console.error(
      "Aufruf: node src/main/migrate.ts <legacy.sqlite> <praxen.json> <naturheilpraxis.db>",
    );
    return 2;
  }

  const praxen = JSON.parse(
    fs.readFileSync(praxenFile, "utf8"),
  ) as LegacyPraxis[];
  const legacyDatabase = LegacyDatabase.open(legacyFile);
  const data = legacyDatabase.read();
  legacyDatabase.close();

  const { events, notes } = migrateLegacyData(data, praxen, () =>
    crypto.randomUUID(),
  );

  const eventStore = SqliteEventStore.create(eventStoreFile);
  try {
    if (eventStore.query().length > 0) {
      console.error(
        `Der Event Store ${eventStoreFile} enthält bereits Daten. Bitte geben Sie eine neue Datei an.`,
      );
      return 1;
    }
    eventStore.append(events, migrationTags(events));
  } finally {
    eventStore.close();
  }

  for (const note of notes) {
    console.log(`Hinweis: ${note}`);
  }
  const counts = Map.groupBy(events, (event) => event.type);
  for (const [type, eventsOfType] of counts) {
    console.log(`${type}: ${eventsOfType.length}`);
  }
  return 0;
}

process.exitCode = main(process.argv.slice(2));
