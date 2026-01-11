// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { type CloudEventV1 } from "cloudevents";
import { describe, expect, it } from "vitest";

import { NaturheilpraxisService } from "../../../src/main/application/naturheilpraxis_service";
import { Patient } from "../../../src/shared/domain/patient";
import { type PatientenkarteiQueryResult } from "../../../src/shared/domain/naturheilpraxis";
import { PatientAufgenommenV1Event } from "../../../src/main/domain/patient_events";
import { EventStore } from "../../../src/main/infrastructure/event_store";

describe("Naturheilpraxis Service", () => {
  describe("Patientenkartei", () => {
    it("Listet alle Patienten auf", async () => {
      const { service } = configure({
        eventLog: [
          PatientAufgenommenV1Event.createTestInstance(),
          PatientAufgenommenV1Event.createTestInstance({
            nummer: 2,
            vorname: "Erika",
            geburtsdatum: "1985-05-05",
          }),
        ],
      });

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
  });

  describe("Patientenkarteikarte", () => {
    it("Suche Patient nach Nummer", async () => {
      const { service } = configure({
        eventLog: [
          PatientAufgenommenV1Event.createTestInstance(),
          PatientAufgenommenV1Event.createTestInstance({
            nummer: 2,
            vorname: "Erika",
            geburtsdatum: "1985-05-05",
          }),
        ],
      });

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

function configure({ eventLog }: { eventLog?: CloudEventV1<unknown>[] } = {}) {
  const eventStore = EventStore.createNull({ events: eventLog });
  const service = new NaturheilpraxisService(eventStore);
  return { service, eventStore };
}
