// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { RechnungenQueryHandler } from "../../../src/main/application/rechnungen_query_handler";
import { Rechnung } from "../../../src/shared/domain/rechnung";
import {
  RechnungenQuery,
  RechnungenQueryResult,
} from "../../../src/shared/domain/rechnungen_query";
import { Patient } from "../../../src/shared/domain/patient";
import { DatenbankProvider } from "../../../src/main/infrastructure/datenbank_provider";
import { RechnungenRepository } from "../../../src/main/infrastructure/rechnungen_repository";
import { PatientenRepository } from "../../../src/main/infrastructure/patienten_repository";

describe("Rechnungen", () => {
  describe("Liste alle Rechnungen auf", () => {
    it("Sollte eine leere Liste zurückgeben, wenn es keinen Rechnungen gibt", async () => {
      const { handler } = configure();

      const result = await handler.handle(RechnungenQuery.create());

      expect(result).toEqual<RechnungenQueryResult>(
        RechnungenQueryResult.create(),
      );
    });

    it("Sollte Rechnungen absteigend sortiert nach Datum zurückgeben", async () => {
      const { handler, patientenRepository, rechnungenRepository } =
        configure();
      patientenRepository.create(
        Patient.createTestInstance({ nummer: 1, vorname: "Max" }),
      );
      patientenRepository.create(
        Patient.createTestInstance({ nummer: 2, vorname: "Erika" }),
      );
      rechnungenRepository.create(
        Rechnung.createTestInstance({
          id: 1,
          datum: "2026-04-15",
          patientId: 1,
        }),
      );
      rechnungenRepository.create(
        Rechnung.createTestInstance({
          id: 2,
          datum: "2026-04-16",
          patientId: 1,
        }),
      );
      rechnungenRepository.create(
        Rechnung.createTestInstance({
          id: 3,
          datum: "2026-04-17",
          patientId: 2,
        }),
      );

      const result = await handler.handle(RechnungenQuery.create());

      expect(result).toEqual<RechnungenQueryResult>(
        RechnungenQueryResult.create({
          rechnungen: [
            Rechnung.createTestInstance({
              id: 3,
              datum: "2026-04-17",
              patientId: 2,
            }),
            Rechnung.createTestInstance({
              id: 2,
              datum: "2026-04-16",
              patientId: 1,
            }),
            Rechnung.createTestInstance({
              id: 1,
              datum: "2026-04-15",
              patientId: 1,
            }),
          ],
        }),
      );
    });
  });

  describe("Liste Rechnungen eines Patienten auf", () => {
    it("Sollte eine leere Liste zurückgeben, wenn es keinen Rechnungen gibt", async () => {
      const { handler } = configure();

      const result = await handler.handle(
        RechnungenQuery.create({ patientennummer: 1 }),
      );

      expect(result).toEqual<RechnungenQueryResult>(
        RechnungenQueryResult.create(),
      );
    });

    it("Sollte Rechnungen absteigend sortiert nach Datum zurückgeben", async () => {
      const { handler, patientenRepository, rechnungenRepository } =
        configure();
      patientenRepository.create(Patient.createTestInstance({ nummer: 1 }));
      patientenRepository.create(Patient.createTestInstance({ nummer: 2 }));
      rechnungenRepository.create(
        Rechnung.createTestInstance({
          id: 1,
          datum: "2026-04-15",
          patientId: 1,
        }),
      );
      rechnungenRepository.create(
        Rechnung.createTestInstance({
          id: 2,
          datum: "2026-04-16",
          patientId: 1,
        }),
      );
      rechnungenRepository.create(
        Rechnung.createTestInstance({
          id: 3,
          datum: "2026-04-17",
          patientId: 2,
        }),
      );

      const result = await handler.handle(
        RechnungenQuery.create({ patientennummer: 1 }),
      );

      expect(result).toEqual<RechnungenQueryResult>(
        RechnungenQueryResult.create({
          rechnungen: [
            Rechnung.createTestInstance({
              id: 2,
              datum: "2026-04-16",
              patientId: 1,
            }),
            Rechnung.createTestInstance({
              id: 1,
              datum: "2026-04-15",
              patientId: 1,
            }),
          ],
        }),
      );
    });

    it("Sollte eine leere Liste zurückgeben, wenn es den Patienten nicht", async () => {
      const { handler, patientenRepository, rechnungenRepository } =
        configure();
      patientenRepository.create(Patient.createTestInstance());
      rechnungenRepository.create(Rechnung.createTestInstance({ id: 1 }));
      rechnungenRepository.create(Rechnung.createTestInstance({ id: 2 }));

      const result = await handler.handle(
        RechnungenQuery.create({ patientennummer: 2 }),
      );

      expect(result).toEqual<RechnungenQueryResult>(
        RechnungenQueryResult.create(),
      );
    });
  });
});

function configure() {
  const datenbankProvider = DatenbankProvider.create();
  const patientenRepository = PatientenRepository.create({ datenbankProvider });
  const rechnungenRepository = RechnungenRepository.create({
    datenbankProvider,
  });
  const handler = RechnungenQueryHandler.create({ rechnungenRepository });
  return { handler, patientenRepository, rechnungenRepository };
}
