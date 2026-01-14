// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { suchePatient } from "../../../src/main/application/suche_patient_query_handler";
import { Patient } from "../../../src/shared/domain/patient";
import {
  SuchePatientQuery,
  SuchePatientQueryResult,
} from "../../../src/shared/domain/suche_patient_query";
import { PatientAufgenommenV1Event } from "../../../src/main/domain/patient_events";
import {
  SuchePatientQueryDto,
  SuchePatientQueryResultDto,
} from "../../../src/shared/infrastructure/suche_patient_query_dto";
import { EventStore } from "../../../src/main/infrastructure/event_store";

describe("Suche Patient", () => {
  describe("Suche Patient mit Nummer", () => {
    it("sollte nichts zurückgeben, wenn der Patient nicht existiert", async () => {
      const eventStore = EventStore.createNull({
        events: [PatientAufgenommenV1Event.createTestInstance()],
      });

      const result = await suchePatient(
        SuchePatientQuery.create({ nummer: 9999 }),
        eventStore,
      );

      expect(result).toEqual<SuchePatientQueryResult>(
        SuchePatientQueryResult.create(),
      );
    });

    it("sollte Patient finden", async () => {
      const eventStore = EventStore.createNull({
        events: [
          PatientAufgenommenV1Event.createTestInstance({
            nummer: 1,
            vorname: "Max",
          }),
          PatientAufgenommenV1Event.createTestInstance({
            nummer: 2,
            vorname: "Erika",
          }),
        ],
      });

      const result = await suchePatient(
        SuchePatientQuery.create({ nummer: 2 }),
        eventStore,
      );

      expect(result).toEqual<SuchePatientQueryResult>(
        SuchePatientQueryResult.create({
          patient: Patient.createTestInstance({
            nummer: 2,
            vorname: "Erika",
          }),
        }),
      );
    });
  });

  describe("Mapping suche Patient Query", () => {
    it("sollte DTO aus Model erstellen", () => {
      const model = SuchePatientQuery.createTestInstance();

      const dto = SuchePatientQueryDto.fromModel(model);

      expect(dto).toEqual<SuchePatientQueryDto>(
        SuchePatientQueryDto.createTestInstance(),
      );
    });

    it("sollte Model aus DTO erstellen", () => {
      const dto = SuchePatientQueryDto.createTestInstance();

      const model = dto.validate();

      expect(model).toEqual<SuchePatientQuery>(
        SuchePatientQuery.createTestInstance(),
      );
    });
  });

  describe("Mapping suche Patient Query Result", () => {
    it("sollte leeres Result erstellen", () => {
      const dto = SuchePatientQueryResult.create();

      expect(dto).toEqual<SuchePatientQueryResult>(
        SuchePatientQueryResult.create(),
      );
    });

    it("sollte DTO aus Model erstellen", () => {
      const model = SuchePatientQueryResult.createTestInstance();

      const dto = SuchePatientQueryResultDto.fromModel(model);

      expect(dto).toEqual<SuchePatientQueryResultDto>(
        SuchePatientQueryResultDto.createTestInstance(),
      );
    });

    it("sollte Model aus DTO erstellen", () => {
      const dto = SuchePatientQueryResultDto.createTestInstance();

      const model = dto.validate();

      expect(model).toEqual<SuchePatientQueryResult>(
        SuchePatientQueryResult.createTestInstance(),
      );
    });
  });
});
