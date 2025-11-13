// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { type CloudEventV1 } from "cloudevents";
import { describe, expect, it } from "vitest";

import { arrayFromAsync } from "../../../src/shared/common/polyfills";
import { NaturheilpraxisService } from "../../../src/main/application/naturheilpraxis-service";
import {
  NimmPatientAufCommand,
  type NimmPatientAufCommandStatus,
  NimmPatientAufSuccess,
  Patient,
  type PatientenkarteiQueryResult,
} from "../../../src/shared/domain/naturheilpraxis";
import { MemoryEventStore } from "../../../src/main/infrastructure/event-store";
import {
  type PatientAufgenommenV1Data,
  PatientAufgenommenV1Event,
} from "../../../src/main/infrastructure/events";

describe("Naturheilpraxis Service", () => {
  describe("Nimm Patient auf", () => {
    it("Erfasst Informationen wie Name, Geburtsdatum, Praxis, Annahmejahr, Anschrift, Kontaktmöglichkeit", async () => {
      const eventStore = new MemoryEventStore();
      const service = new NaturheilpraxisService(eventStore);

      const status = await service.nimmPatientAuf(
        NimmPatientAufCommand.createTestInstance(),
      );

      expect(status).toEqual<NimmPatientAufCommandStatus>(
        NimmPatientAufSuccess.create({ nummer: 1 }),
      );
      const events = await arrayFromAsync(eventStore.replay());
      expect(events).toEqual<CloudEventV1<PatientAufgenommenV1Data>[]>([
        {
          ...PatientAufgenommenV1Event.createTestInstance(),
          id: expect.any(String),
          time: expect.any(String),
        },
      ]);
    });

    it("Zählt Patientennummer hoch", async () => {
      const eventStore = new MemoryEventStore();
      const service = new NaturheilpraxisService(eventStore);
      await service.nimmPatientAuf(NimmPatientAufCommand.createTestInstance());

      const status = await service.nimmPatientAuf(
        Patient.createTestInstance({
          vorname: "Erika",
          geburtsdatum: "1985-05-05",
        }),
      );

      expect(status).toEqual<NimmPatientAufCommandStatus>(
        NimmPatientAufSuccess.create({ nummer: 2 }),
      );
      const events = await arrayFromAsync(eventStore.replay());
      expect(events.slice(-1)).toEqual<
        CloudEventV1<PatientAufgenommenV1Data>[]
      >([
        {
          ...PatientAufgenommenV1Event.createTestInstance({
            nummer: 2,
            vorname: "Erika",
            geburtsdatum: "1985-05-05",
          }),
          id: expect.any(String),
          time: expect.any(String),
        },
      ]);
    });

    it("Schreibt keine leeren Strings", async () => {
      const eventStore = new MemoryEventStore();
      const service = new NaturheilpraxisService(eventStore);

      const status = await service.nimmPatientAuf(
        NimmPatientAufCommand.createTestInstance({ anrede: "" }),
      );

      expect(status).toEqual<NimmPatientAufCommandStatus>(
        NimmPatientAufSuccess.create({ nummer: 1 }),
      );
      const events = await arrayFromAsync(eventStore.replay());
      expect(events).toEqual<CloudEventV1<PatientAufgenommenV1Data>[]>([
        {
          ...PatientAufgenommenV1Event.createTestInstance(),
          id: expect.any(String),
          time: expect.any(String),
        },
      ]);
    });
  });

  describe("Patientenkartei", () => {
    it("Listet alle Patienten auf", async () => {
      const eventStore = new MemoryEventStore(
        PatientAufgenommenV1Event.createTestInstance(),
        PatientAufgenommenV1Event.createTestInstance({
          nummer: 2,
          vorname: "Erika",
          geburtsdatum: "1985-05-05",
        }),
      );
      const service = new NaturheilpraxisService(eventStore);

      const result = await service.queryPatientenkartei({});

      expect(result).toEqual<PatientenkarteiQueryResult>({
        patienten: [
          Patient.createTestInstance({
            nummer: 2,
            vorname: "Erika",
            geburtsdatum: "1985-05-05",
          }),

          Patient.createTestInstance(),
        ],
      });
    });

    it("Suche Patient nach Nummer", async () => {
      const eventStore = new MemoryEventStore(
        PatientAufgenommenV1Event.createTestInstance(),
        PatientAufgenommenV1Event.createTestInstance({
          nummer: 2,
          vorname: "Erika",
          geburtsdatum: "1985-05-05",
        }),
      );
      const service = new NaturheilpraxisService(eventStore);

      const result = await service.queryPatientenkartei({ nummer: 2 });

      expect(result).toEqual<PatientenkarteiQueryResult>({
        patienten: [
          Patient.createTestInstance({
            nummer: 2,
            vorname: "Erika",
            geburtsdatum: "1985-05-05",
          }),
        ],
      });
    });
  });
});
