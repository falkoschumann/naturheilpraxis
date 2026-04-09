// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { PatientQueryHandler } from "../../../src/main/application/patient_query_handler";
import { Einstellungen } from "../../../src/shared/domain/einstellungen";
import { Patient } from "../../../src/shared/domain/patient";
import {
  PatientQuery,
  PatientQueryResult,
} from "../../../src/shared/domain/suche_patient_query";
import { DatenbankProvider } from "../../../src/main/infrastructure/datenbank_provider";
import { EinstellungenProvider } from "../../../src/main/infrastructure/einstellungen_provider";
import { PatientenRepository } from "../../../src/main/infrastructure/patienten_repository";
import { UhrProvider } from "../../../src/main/infrastructure/uhr_provider";

describe("Suche Patient", () => {
  describe("Suche Patient mit Nummer", () => {
    it("sollte Patient finden", async () => {
      const { handler, patientenRepository } = configure();
      patientenRepository.create(
        Patient.createTestInstance({ vorname: "Max" }),
      );
      patientenRepository.create(
        Patient.createTestInstance({ vorname: "Erika" }),
      );

      const result = await handler.handle(PatientQuery.create({ nummer: 2 }));

      expect(result).toEqual<PatientQueryResult>(
        PatientQueryResult.createTestInstance({
          patient: Patient.createTestInstance({
            nummer: 2,
            vorname: "Erika",
          }),
        }),
      );
    });

    it("sollte neuen Patient vorbereiten, wenn keine Nummer angegeben ist", async () => {
      const { handler, patientenRepository } = configure();
      patientenRepository.create(Patient.createTestInstance());

      const result = await handler.handle(PatientQuery.create());

      expect(result).toEqual<PatientQueryResult>(
        PatientQueryResult.createTestInstance({
          patient: Patient.create({
            annahmejahr: 2026,
            praxis: "Praxis 1",
            schluesselworte: ["Aktiv", "Weihnachtskarte"],
          }),
        }),
      );
    });

    it("sollte nichts zurückgeben, wenn der Patient nicht existiert", async () => {
      const { handler, patientenRepository } = configure();
      patientenRepository.create(Patient.createTestInstance());

      const result = await handler.handle(
        PatientQuery.create({ nummer: 9999 }),
      );

      expect(result).toEqual<PatientQueryResult>({
        ...PatientQueryResult.createTestInstance(),
        patient: undefined,
      });
    });
  });
});

function configure() {
  const datenbankProvider = DatenbankProvider.create();
  const patientenRepository = PatientenRepository.create({ datenbankProvider });
  const einstellungenProvider = EinstellungenProvider.create({
    datenbankProvider,
  });
  einstellungenProvider.sichere(Einstellungen.createTestInstance());
  const uhrProvider = UhrProvider.createTestInstance();
  const handler = PatientQueryHandler.create({
    patientenRepository,
    einstellungenProvider: einstellungenProvider,
    uhrProvider,
  });
  return { handler, patientenRepository };
}
