// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { suchePatient } from "../../../src/main/application/suche_patient_query_handler";
import { Patient } from "../../../src/shared/domain/patient";
import {
  PatientQuery,
  PatientQueryResult,
} from "../../../src/shared/domain/suche_patient_query";
import { PatientAufgenommenV1Event } from "../../../src/main/domain/patient_events";
import {
  PatientQueryDto,
  PatientQueryResultDto,
} from "../../../src/shared/infrastructure/suche_patient_query_dto";
import { NdjsonEventStore } from "../../../src/main/infrastructure/ndjson_event_store";

describe("Suche Patient", () => {
  describe("Suche Patient mit Nummer", () => {
    it("sollte nichts zurückgeben, wenn der Patient nicht existiert", async () => {
      const eventStore = NdjsonEventStore.createNull({
        events: [PatientAufgenommenV1Event.createTestInstance()],
      });

      const result = await suchePatient(PatientQuery.create({ nummer: 9999 }), {
        eventStore,
      });

      expect(result).toEqual<PatientQueryResult>(PatientQueryResult.create());
    });

    it("sollte Patient finden", async () => {
      const eventStore = NdjsonEventStore.createNull({
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

      const result = await suchePatient(PatientQuery.create({ nummer: 2 }), {
        eventStore,
      });

      expect(result).toEqual<PatientQueryResult>(
        PatientQueryResult.create({
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
      const model = PatientQuery.createTestInstance();

      const dto = PatientQueryDto.fromModel(model);

      expect(dto).toEqual<PatientQueryDto>(
        PatientQueryDto.createTestInstance(),
      );
    });

    it("sollte Model aus DTO erstellen", () => {
      const dto = PatientQueryDto.createTestInstance();

      const model = dto.validate();

      expect(model).toEqual<PatientQuery>(PatientQuery.createTestInstance());
    });
  });

  describe("Mapping suche Patient Query Result", () => {
    it("sollte leeres Result erstellen", () => {
      const dto = PatientQueryResult.create();

      expect(dto).toEqual<PatientQueryResult>(PatientQueryResult.create());
    });

    it("sollte DTO aus Model erstellen", () => {
      const model = PatientQueryResult.createTestInstance();

      const dto = PatientQueryResultDto.fromModel(model);

      expect(dto).toEqual<PatientQueryResultDto>(
        PatientQueryResultDto.createTestInstance(),
      );
    });

    it("sollte Model aus DTO erstellen", () => {
      const dto = PatientQueryResultDto.createTestInstance();

      const model = dto.validate();

      expect(model).toEqual<PatientQueryResult>(
        PatientQueryResult.createTestInstance(),
      );
    });
  });
});
