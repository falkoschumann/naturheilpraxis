// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";
import { arrayFromAsync } from "../../src/main/common/polyfills";
import { NaturheilpraxisService } from "../../src/main/application/naturheilpraxis-service";
import { MemoryEventStore } from "../../src/main/infrastructure/event-store";
import {
  CLOUD_EVENT_SPEC_VERSION,
  PATIENT_AUFGENOMMEN_V1_EVENT_TYPE,
  PATIENT_SOURCE,
} from "../../src/main/infrastructure/events";
import { NimmPatientAufSuccess } from "../../src/main/domain/naturheilpraxis";

describe("Naturheilpraxis Service", () => {
  describe("Nimm Patient auf", () => {
    it("Erfasst Informationen wie Name, Geburtsdatum, Praxis, Annahmejahr, Anschrift, Kontaktmöglichkeit", async () => {
      const eventStore = new MemoryEventStore();
      const service = new NaturheilpraxisService(eventStore);

      const status = await service.nimmPatientAuf(createTestPatient());

      expect(status).toEqual(new NimmPatientAufSuccess(1));
      const events = await arrayFromAsync(eventStore.replay());
      expect(events).toEqual([
        {
          id: expect.any(String),
          type: PATIENT_AUFGENOMMEN_V1_EVENT_TYPE,
          source: PATIENT_SOURCE,
          specversion: CLOUD_EVENT_SPEC_VERSION,
          time: expect.any(String),
          data: { ...createTestPatient(), nummer: 1 },
        },
      ]);
    });

    it("Zählt Patientennummer hoch", async () => {
      const eventStore = new MemoryEventStore();
      const service = new NaturheilpraxisService(eventStore);
      await service.nimmPatientAuf(createTestPatient());

      const status = await service.nimmPatientAuf(
        createTestPatient({
          vorname: "Erika",
          geburtsdatum: "1985-05-05",
        }),
      );

      expect(status).toEqual(new NimmPatientAufSuccess(2));
      const events = await arrayFromAsync(eventStore.replay());
      expect(events.slice(-1)).toEqual([
        {
          id: expect.any(String),
          type: PATIENT_AUFGENOMMEN_V1_EVENT_TYPE,
          source: PATIENT_SOURCE,
          specversion: CLOUD_EVENT_SPEC_VERSION,
          time: expect.any(String),
          data: {
            ...createTestPatient(),
            nummer: 2,
            vorname: "Erika",
            geburtsdatum: "1985-05-05",
          },
        },
      ]);
    });

    it("Schreibt keine leeren Strings", async () => {
      const eventStore = new MemoryEventStore();
      const service = new NaturheilpraxisService(eventStore);

      const status = await service.nimmPatientAuf(
        createTestPatient({ anrede: "" }),
      );

      expect(status).toEqual(new NimmPatientAufSuccess(1));
      const events = await arrayFromAsync(eventStore.replay());
      expect(events).toEqual([
        {
          id: expect.any(String),
          type: PATIENT_AUFGENOMMEN_V1_EVENT_TYPE,
          source: PATIENT_SOURCE,
          specversion: CLOUD_EVENT_SPEC_VERSION,
          time: expect.any(String),
          data: { ...createTestPatient(), nummer: 1 },
        },
      ]);
    });
  });

  describe("Patientenkartei", () => {
    it("Listet alle Patienten auf", async () => {
      const eventStore = new MemoryEventStore();
      const service = new NaturheilpraxisService(eventStore);
      await service.nimmPatientAuf(createTestPatient());
      await service.nimmPatientAuf(
        createTestPatient({
          vorname: "Erika",
          geburtsdatum: "1985-05-05",
        }),
      );

      const result = await service.patientenkartei({});

      expect(result).toEqual({
        patienten: [
          {
            ...createTestPatient(),
            nummer: 2,
            vorname: "Erika",
            geburtsdatum: "1985-05-05",
          },
          {
            ...createTestPatient(),
            nummer: 1,
          },
        ],
      });
    });

    it("Suche Patient nach Nummer", async () => {
      const eventStore = new MemoryEventStore();
      const service = new NaturheilpraxisService(eventStore);
      await service.nimmPatientAuf(createTestPatient());
      await service.nimmPatientAuf(
        createTestPatient({
          vorname: "Erika",
          geburtsdatum: "1985-05-05",
        }),
      );

      const result = await service.patientenkartei({ nummer: 2 });

      expect(result).toEqual({
        patienten: [
          {
            ...createTestPatient(),
            nummer: 2,
            vorname: "Erika",
            geburtsdatum: "1985-05-05",
          },
        ],
      });
    });
  });
});

function createTestPatient({
  anrede,
  vorname = "Max",
  nachname = "Mustermann",
  geburtsdatum = "1980-01-01",
  annahmejahr = 2025,
  praxis = "Naturheilpraxis",
}: {
  anrede?: string;
  nachname?: string;
  vorname?: string;
  geburtsdatum?: string;
  annahmejahr?: number;
  praxis?: string;
} = {}) {
  return { anrede, vorname, nachname, geburtsdatum, annahmejahr, praxis };
}
