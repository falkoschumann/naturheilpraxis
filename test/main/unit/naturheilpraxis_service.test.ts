// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { type CloudEventV1 } from "cloudevents";
import { describe, expect, it } from "vitest";

import { NaturheilpraxisService } from "../../../src/main/application/naturheilpraxis_service";
import {
  NimmPatientAufCommand,
  type NimmPatientAufCommandStatus,
  NimmPatientAufSuccess,
  Patient,
  type PatientenkarteiQueryResult,
} from "../../../src/shared/domain/naturheilpraxis";
import { EventStore } from "../../../src/main/infrastructure/event_store";
import {
  type PatientAufgenommenV1Data,
  PatientAufgenommenV1Event,
} from "../../../src/main/infrastructure/events";

describe("Naturheilpraxis Service", () => {
  describe("Nimm Patient auf", () => {
    describe("Erfasst Informationen wie Name, Geburtsdatum, Praxis, Annahmejahr, Anschrift, Kontaktmöglichkeit", async () => {
      it("sollte neuen Patienten erfassen", async () => {
        const { service, eventStore } = configure();
        const recordedEvents = eventStore.trackRecordedEvents();

        const status = await service.nimmPatientAuf(
          NimmPatientAufCommand.createTestInstance(),
        );

        expect(status).toEqual<NimmPatientAufCommandStatus>(
          NimmPatientAufSuccess.create({ nummer: 1 }),
        );
        expect(recordedEvents.data).toEqual<
          CloudEventV1<PatientAufgenommenV1Data>[]
        >([
          {
            ...PatientAufgenommenV1Event.createTestInstance(),
            id: expect.any(String),
            time: expect.any(String),
          },
        ]);
      });

      it("sollte Patientennummer hochzählen", async () => {
        const { service, eventStore } = configure({
          eventLog: [PatientAufgenommenV1Event.createTestInstance()],
        });
        const recordedEvents = eventStore.trackRecordedEvents();

        const status = await service.nimmPatientAuf(
          Patient.createTestInstance({
            vorname: "Erika",
            geburtsdatum: "1985-05-05",
          }),
        );

        expect(status).toEqual<NimmPatientAufCommandStatus>(
          NimmPatientAufSuccess.create({ nummer: 2 }),
        );
        expect(recordedEvents.data).toEqual<
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

      it("sollte keine leeren Strings schreiben, außer für Pflichtfelder", async () => {
        const { service, eventStore } = configure();
        const recordedEvents = eventStore.trackRecordedEvents();

        const status = await service.nimmPatientAuf(
          NimmPatientAufCommand.create({
            nachname: "",
            vorname: "",
            geburtsdatum: "1900-01-01",
            annahmejahr: 1900,
            praxis: "",
            anrede: "",
            strasse: "",
            wohnort: "",
            postleitzahl: "",
            staat: "",
            staatsangehoerigkeit: "",
            titel: "",
            beruf: "",
            telefon: "",
            mobil: "",
            eMail: "",
            familienstand: "",
            partner: "",
            eltern: "",
            kinder: "",
            geschwister: "",
            notizen: "",
            schluesselworte: [],
          }),
        );

        expect(status).toEqual<NimmPatientAufCommandStatus>(
          NimmPatientAufSuccess.create({ nummer: 1 }),
        );
        expect(recordedEvents.data).toEqual<
          CloudEventV1<PatientAufgenommenV1Data>[]
        >([
          {
            ...PatientAufgenommenV1Event.create({
              nummer: 1,
              nachname: "",
              vorname: "",
              geburtsdatum: "1900-01-01",
              annahmejahr: 1900,
              praxis: "",
            }),
            id: expect.any(String),
            time: expect.any(String),
          },
        ]);
      });
    });
  });

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
