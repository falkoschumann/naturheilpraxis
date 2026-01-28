// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { suchePatienten } from "../../../src/main/application/suche_patienten_query_handler";
import { Patient } from "../../../src/shared/domain/patient";
import {
  PatientenQuery,
  PatientenQueryResult,
} from "../../../src/shared/domain/suche_patienten_query";
import { PatientAufgenommenV1Event } from "../../../src/main/domain/patient_events";
import {
  PatientenQueryDto,
  PatientenQueryResultDto,
} from "../../../src/shared/infrastructure/suche_patienten_query_dto";
import { NdjsonEventStore } from "../../../src/main/infrastructure/ndjson_event_store";

describe("Suche Patienten", () => {
  describe("Liste alle Patienten auf", () => {
    it("Sollte eine leere Liste zurückgeben, wenn es keinen Patienten gibt", async () => {
      const eventStore = NdjsonEventStore.createNull();

      const result = await suchePatienten(PatientenQuery.create(), {
        eventStore,
      });

      expect(result).toEqual<PatientenQueryResult>({ patienten: [] });
    });

    it("Sollte alle Patienten absteigend sortiert nach Nummer zurückgeben", async () => {
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

      const result = await suchePatienten(PatientenQuery.create(), {
        eventStore,
      });

      expect(result).toEqual<PatientenQueryResult>({
        patienten: [
          Patient.createTestInstance({
            nummer: 2,
            vorname: "Erika",
          }),
          Patient.createTestInstance({
            nummer: 1,
            vorname: "Max",
          }),
        ],
      });
    });
  });

  describe("Mapping suche Patienten Query", () => {
    it("sollte DTO aus Model erstellen", () => {
      const model = PatientenQuery.createTestInstance();

      const dto = PatientenQueryDto.fromModel(model);

      expect(dto).toEqual<PatientenQueryDto>(
        PatientenQueryDto.createTestInstance(),
      );
    });

    it("sollte Model aus DTO erstellen", () => {
      const dto = PatientenQueryDto.createTestInstance();

      const model = dto.validate();

      expect(model).toEqual<PatientenQuery>(
        PatientenQuery.createTestInstance(),
      );
    });
  });

  describe("Mapping suche Patienten Query Result", () => {
    it("sollte leeres Result erstellen", () => {
      const dto = PatientenQueryResult.create();

      expect(dto).toEqual<PatientenQueryResult>(
        PatientenQueryResult.create({ patienten: [] }),
      );
    });

    it("sollte DTO aus Model erstellen", () => {
      const model = PatientenQueryResult.createTestInstance();

      const dto = PatientenQueryResultDto.fromModel(model);

      expect(dto).toEqual<PatientenQueryResultDto>(
        PatientenQueryResultDto.createTestInstance(),
      );
    });

    it("sollte Model aus DTO erstellen", () => {
      const dto = PatientenQueryResultDto.createTestInstance();

      const model = dto.validate();

      expect(model).toEqual<PatientenQueryResult>(
        PatientenQueryResult.createTestInstance(),
      );
    });
  });
});
