// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { arrayFromAsync } from "../../src/main/common/polyfills";
import { NaturheilpraxisService } from "../../src/main/application/naturheilpraxis-service";
import { MemoryEventStore } from "../../src/main/integration/event-store";
import { Success } from "../../src/main/common/messages";

describe("Naturheilpraxis Service", () => {
  describe("Nimm Patient auf", () => {
    it("Erfasst Informationen wie Name, Geburtsdatum, Praxis, Annahmejahr, Anschrift, Kontaktmöglichkeit", async () => {
      const eventStore = new MemoryEventStore();
      const service = new NaturheilpraxisService(eventStore);

      const status = await service.nimmPatientAuf({
        nachname: "Mustermann",
        vorname: "Max",
        geburtsdatum: "1980-01-01",
        annahmejahr: "2025",
        praxis: "Naturheilpraxis",
      });

      expect(status).toEqual(new Success());
      const events = await arrayFromAsync(eventStore.replay());
      expect(events).toEqual([
        {
          id: expect.any(String),
          type: "de.muspellheim.naturheilpraxis.patient-aufgenommen.v1",
          source: "/naturheilpraxis/patient",
          specversion: "1.0",
          time: expect.any(String),
          data: {
            nummer: 1,
            nachname: "Mustermann",
            vorname: "Max",
            geburtsdatum: "1980-01-01",
            annahmejahr: "2025",
            praxis: "Naturheilpraxis",
          },
        },
      ]);
    });

    it("Zählt Patientennummer hoch", async () => {
      const eventStore = new MemoryEventStore();
      const service = new NaturheilpraxisService(eventStore);
      await service.nimmPatientAuf({
        nachname: "Mustermann",
        vorname: "Max",
        geburtsdatum: "1980-01-01",
        annahmejahr: "2025",
        praxis: "Naturheilpraxis",
      });

      const status = await service.nimmPatientAuf({
        nachname: "Mustermann",
        vorname: "Erika",
        geburtsdatum: "1985-05-05",
        annahmejahr: "2025",
        praxis: "Naturheilpraxis",
      });

      expect(status).toEqual(new Success());
      const events = await arrayFromAsync(eventStore.replay());
      expect(events.slice(-1)).toEqual([
        {
          id: expect.any(String),
          type: "de.muspellheim.naturheilpraxis.patient-aufgenommen.v1",
          source: "/naturheilpraxis/patient",
          specversion: "1.0",
          time: expect.any(String),
          data: {
            nummer: 2,
            nachname: "Mustermann",
            vorname: "Erika",
            geburtsdatum: "1985-05-05",
            annahmejahr: "2025",
            praxis: "Naturheilpraxis",
          },
        },
      ]);
    });
  });
});
