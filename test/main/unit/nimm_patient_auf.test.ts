// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Failure, Success } from "@muspellheim/shared";
import type { CloudEventV1 } from "cloudevents";
import { describe, expect, it } from "vitest";

import { nimmPatientAuf } from "../../../src/main/application/nimm_patient_auf_command_handler";
import { Patient } from "../../../src/shared/domain/patient";
import {
  NimmPatientAufCommand,
  type NimmPatientAufCommandStatus,
} from "../../../src/shared/domain/nimm_patient_auf_command";
import {
  type PatientAufgenommenV1Data,
  PatientAufgenommenV1Event,
} from "../../../src/main/domain/patient_events";
import { EventStore } from "../../../src/main/infrastructure/event_store";
import {
  NimmPatientAufCommandDto,
  NimmPatientAufCommandStatusDto,
} from "../../../src/shared/infrastructure/nimm_patient_auf_command_dto";

describe("Nimm Patient auf", () => {
  describe("Erfasse Informationen wie Name, Geburtsdatum, Praxis, Annahmejahr, Anschrift und Kontaktmöglichkeit", () => {
    it("sollte neuen Patienten erfassen", async () => {
      const eventStore = EventStore.createNull();
      const recordedEvents = eventStore.trackRecordedEvents();

      const status = await nimmPatientAuf(
        NimmPatientAufCommand.createTestInstance(),
        eventStore,
      );

      expect(status).toEqual<Success<{ nummer: number }>>(
        new Success({ nummer: 1 }),
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
      const eventStore = EventStore.createNull({
        events: [PatientAufgenommenV1Event.createTestInstance()],
      });
      const recordedEvents = eventStore.trackRecordedEvents();

      const status = await nimmPatientAuf(
        Patient.createTestInstance({
          vorname: "Erika",
          geburtsdatum: "1985-05-05",
        }),
        eventStore,
      );

      expect(status).toEqual<Success<{ nummer: number }>>(
        new Success({ nummer: 2 }),
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
      const eventStore = EventStore.createNull();
      const recordedEvents = eventStore.trackRecordedEvents();

      const status = await nimmPatientAuf(
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
        eventStore,
      );

      expect(status).toEqual<Success<{ nummer: number }>>(
        new Success({ nummer: 1 }),
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

  describe("Mapping nimm Patient auf Command", () => {
    it("sollte DTO aus Model erstellen", () => {
      const model = NimmPatientAufCommand.createTestInstance();

      const dto = NimmPatientAufCommandDto.fromModel(model);

      expect(dto).toEqual<NimmPatientAufCommandDto>(
        NimmPatientAufCommandDto.createTestInstance(),
      );
    });

    it("sollte Model aus DTO erstellen", () => {
      const dto = NimmPatientAufCommandDto.createTestInstance();

      const model = dto.validate();

      expect(model).toEqual<NimmPatientAufCommand>(
        NimmPatientAufCommand.createTestInstance(),
      );
    });
  });

  describe("Mapping nimm Patient auf Command Status", () => {
    it("sollte DTO aus Success-Model erstellen", () => {
      const model = new Success({ nummer: 42 });

      const dto = NimmPatientAufCommandStatusDto.fromModel(model);

      expect(dto).toEqual<NimmPatientAufCommandStatusDto>(
        NimmPatientAufCommandStatusDto.create({
          isSuccess: true,
          nummer: 42,
        }),
      );
    });

    it("sollte DTO aus Failure-Model erstellen", () => {
      const model = new Failure("Test Fehler");

      const dto = NimmPatientAufCommandStatusDto.fromModel(model);

      expect(dto).toEqual<NimmPatientAufCommandStatusDto>(
        NimmPatientAufCommandStatusDto.create({
          isSuccess: false,
          errorMessage: "Test Fehler",
        }),
      );
    });

    it("sollte Success-Model aus DTO erstellen", () => {
      const dto = NimmPatientAufCommandStatusDto.create({
        isSuccess: true,
        nummer: 42,
      });

      const model = dto.validate();

      expect(model).toEqual<NimmPatientAufCommandStatus>(
        new Success({ nummer: 42 }),
      );
    });

    it("sollte Failure-Model aus DTO erstellen", () => {
      const dto = NimmPatientAufCommandStatusDto.create({
        isSuccess: false,
        errorMessage: "Test Fehler",
      });

      const model = dto.validate();

      expect(model).toEqual<Failure>(new Failure("Test Fehler"));
    });
  });
});
