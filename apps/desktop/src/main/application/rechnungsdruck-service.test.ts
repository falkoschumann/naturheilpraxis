// Copyright (c) 2026 Falko Schumann. MIT license.

import { describe, expect, it } from "vitest";

import type { DomainEvent } from "../../shared/domain/events.ts";
import { resolveRechnungId } from "../infrastructure/app-protocol.ts";
import { SqliteEventStore } from "../infrastructure/event-store.ts";
import type { Printer, PrintResult } from "../infrastructure/printer.ts";
import { SqliteTemplateStore } from "../infrastructure/template-store.ts";
import { NaturheilpraxisService } from "./naturheilpraxis-service.ts";
import { RechnungsdruckService } from "./rechnungsdruck-service.ts";
import { RechnungsvorlagenService } from "./rechnungsvorlagen-service.ts";

const rechnungId = "33333333-3333-4333-8333-333333333333";
const andereRechnungId = "44444444-4444-4444-8444-444444444444";
const leistungId = "22222222-2222-4222-8222-222222222222";

describe("Rechnungsdruck Service", () => {
  describe("Rechnung mit Vorlage ermitteln", () => {
    it("sollte die Standardvorlage liefern, solange keine Vorlage gesichert ist", async () => {
      const { service } = createService();

      const ergebnis = await service.rechnungMitVorlageErmitteln(rechnungId);

      expect(ergebnis?.rechnung.positionen).toHaveLength(1);
      expect(ergebnis?.vorlage).toBe("<p>Standard</p>");
    });

    it("sollte die Vorlage der Praxis der Rechnung liefern", async () => {
      const templateStore = SqliteTemplateStore.createInMemory();
      templateStore.save("rechnung", "<p>allgemein</p>");
      templateStore.save("rechnung", "<p>NHP</p>", { praxiskuerzel: "NHP" });
      const { service } = createService({ templateStore });

      const ergebnis = await service.rechnungMitVorlageErmitteln(rechnungId);

      expect(ergebnis?.vorlage).toBe("<p>NHP</p>");
    });

    it("sollte nichts liefern, wenn es die Rechnung nicht gibt", async () => {
      const { service } = createService();

      const ergebnis =
        await service.rechnungMitVorlageErmitteln(andereRechnungId);

      expect(ergebnis).toBeUndefined();
    });
  });

  describe("Rechnung drucken", () => {
    it("sollte die Rechnung von der Adresse drucken, unter der die App sie liefert", async () => {
      const { service, printer } = createService();

      const status = await service.rechnungDrucken(rechnungId);

      expect(status).toEqual({ printed: true });
      expect(printer.urls).toHaveLength(1);
      expect(resolveRechnungId(printer.urls[0] ?? "")).toBe(rechnungId);
    });

    it("sollte nichts melden, wenn der Druck abgebrochen wurde", async () => {
      const { service } = createService({ result: "cancelled" });

      const status = await service.rechnungDrucken(rechnungId);

      expect(status).toEqual({ printed: false });
    });

    it("sollte erklären, dass die Vorlage fehlerhaft ist", async () => {
      const { service } = createService({ result: "not-loaded" });

      const status = await service.rechnungDrucken(rechnungId);

      expect(status).toEqual({
        printed: false,
        errorMessage: expect.stringContaining(
          "Bitte prüfen Sie die Platzhalter der Rechnungsvorlage.",
        ),
      });
    });

    it("sollte erklären, dass der Druck fehlgeschlagen ist", async () => {
      const { service } = createService({ result: "failed" });

      const status = await service.rechnungDrucken(rechnungId);

      expect(status).toEqual({
        printed: false,
        errorMessage: expect.stringContaining("Drucker eingerichtet"),
      });
    });

    it("sollte eine Rechnung, die es nicht gibt, nicht drucken", async () => {
      const { service, printer } = createService();

      const status = await service.rechnungDrucken(andereRechnungId);

      expect(status).toEqual({
        printed: false,
        errorMessage: "Diese Rechnung gibt es nicht (mehr).",
      });
      expect(printer.urls).toEqual([]);
    });
  });
});

class FakePrinter implements Printer {
  readonly urls: string[] = [];
  readonly #result: PrintResult;

  constructor(result: PrintResult) {
    this.#result = result;
  }

  print(url: string): Promise<PrintResult> {
    this.urls.push(url);
    return Promise.resolve(this.#result);
  }
}

function createService({
  templateStore = SqliteTemplateStore.createInMemory(),
  result = "printed",
}: { templateStore?: SqliteTemplateStore; result?: PrintResult } = {}) {
  const eventStore = SqliteEventStore.createInMemory();
  eventStore.append(createEvents());
  const printer = new FakePrinter(result);
  const naturheilpraxis = new NaturheilpraxisService(eventStore);
  const service = new RechnungsdruckService(
    naturheilpraxis,
    new RechnungsvorlagenService({
      naturheilpraxis,
      templateStore,
      fileDialog: {
        chooseTemplateToExport: () => Promise.resolve(undefined),
        chooseTemplateToImport: () => Promise.resolve(undefined),
      },
      standardvorlage: "<p>Standard</p>",
    }),
    printer,
  );
  return { service, printer };
}

function createEvents(): DomainEvent[] {
  return [
    {
      type: "praxis-angelegt",
      data: {
        praxiskuerzel: "NHP",
        name: "Naturheilpraxis am Markt",
        anschrift: {
          strasse: "Marktplatz 1",
          postleitzahl: "12345",
          ort: "Musterstadt",
        },
        rechnungstext: "Zahlbar in 14 Tagen.",
      },
    },
    {
      type: "patient-aufgenommen",
      data: {
        patientennummer: 1,
        praxiskuerzel: "NHP",
        aufnahmejahr: 2026,
        geburtsdatum: "1980-09-20",
        name: { vorname: "Max", nachname: "Mustermann" },
      },
    },
    {
      type: "leistung-erbracht",
      data: {
        leistungId,
        praxiskuerzel: "NHP",
        patientennummer: 1,
        datum: "2026-09-14",
        ziffer: "1",
        bezeichnung: "Eingehende Untersuchung",
        anzahl: 1,
        einzelbetrag: { cents: 2050 },
      },
    },
    {
      type: "rechnung-erstellt",
      data: {
        rechnungId,
        praxiskuerzel: "NHP",
        patientennummer: 1,
        diagnosetext: "Rückenschmerzen",
        rechnungstext: "Zahlbar in 14 Tagen.",
        leistungen: [leistungId],
      },
    },
  ];
}
