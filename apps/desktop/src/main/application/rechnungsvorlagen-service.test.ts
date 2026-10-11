// Copyright (c) 2026 Falko Schumann. MIT license.

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { rechnungsvorlageUrl } from "../../shared/application/rechnungsvorlagen-api.ts";
import type { DomainEvent } from "../../shared/domain/events.ts";
import { resolveVorlagengeltung } from "../infrastructure/app-protocol.ts";
import { SqliteEventStore } from "../infrastructure/event-store.ts";
import type { TemplateFileDialog } from "../infrastructure/file-dialog.ts";
import { SqliteTemplateStore } from "../infrastructure/template-store.ts";
import { NaturheilpraxisService } from "./naturheilpraxis-service.ts";
import { RechnungsvorlagenService } from "./rechnungsvorlagen-service.ts";

const standardvorlage = "<p>Standard</p>";

describe("Rechnungsvorlagen Service", () => {
  let directory: string;

  beforeEach(async () => {
    directory = await fs.mkdtemp(path.join(os.tmpdir(), "naturheilpraxis-"));
  });

  afterEach(async () => {
    await fs.rm(directory, { recursive: true, force: true });
  });

  function datei(name: string): string {
    return path.join(directory, name);
  }

  describe("Geltende Vorlage", () => {
    it("sollte die Standardvorlage nutzen, solange keine Vorlage gesichert ist", () => {
      const { service } = createService();

      expect(service.geltendeVorlage({})).toBe(standardvorlage);
      expect(service.geltendeVorlage({ praxiskuerzel: "NHP" })).toBe(
        standardvorlage,
      );
    });

    it("sollte für eine Praxis ohne eigene Vorlage die allgemeine nutzen", () => {
      const { service, templateStore } = createService();
      templateStore.save("rechnung", "<p>allgemein</p>");
      templateStore.save("rechnung", "<p>NHP</p>", { praxiskuerzel: "NHP" });

      expect(service.geltendeVorlage({ praxiskuerzel: "NHP" })).toBe(
        "<p>NHP</p>",
      );
      expect(service.geltendeVorlage({ praxiskuerzel: "ABC" })).toBe(
        "<p>allgemein</p>",
      );
      expect(service.geltendeVorlage({})).toBe("<p>allgemein</p>");
    });
  });

  describe("Rechnungsvorlagen ermitteln", () => {
    it("sollte die allgemeine Vorlage und die Vorlage jeder Praxis mit Herkunft liefern", async () => {
      const { service, templateStore } = createService();
      templateStore.save("rechnung", "<p>NHP</p>", { praxiskuerzel: "NHP" });

      const vorlagen = await service.rechnungsvorlagenErmitteln();

      expect(vorlagen).toEqual([
        { bezeichnung: "Allgemein", herkunft: "standardvorlage" },
        {
          praxiskuerzel: "ABC",
          bezeichnung: "Naturheilpraxis am Bahnhof",
          herkunft: "allgemeine",
        },
        {
          praxiskuerzel: "NHP",
          bezeichnung: "Naturheilpraxis am Markt",
          herkunft: "eigene",
        },
      ]);
    });

    it("sollte eine eigene allgemeine Vorlage kennzeichnen", async () => {
      const { service, templateStore } = createService();
      templateStore.save("rechnung", "<p>allgemein</p>");

      const [allgemein] = await service.rechnungsvorlagenErmitteln();

      expect(allgemein).toEqual({
        bezeichnung: "Allgemein",
        herkunft: "eigene",
      });
    });
  });

  describe("Rechnungsvorlage exportieren", () => {
    it("sollte die geltende Vorlage der Praxis als Datei sichern", async () => {
      const fileDialog = new FakeTemplateFileDialog({
        exportFile: datei("export.html"),
      });
      const { service, templateStore } = createService({ fileDialog });
      templateStore.save("rechnung", "<p>allgemein</p>");

      const status = await service.rechnungsvorlageExportieren({
        praxiskuerzel: "NHP",
      });

      expect(status).toEqual({ completed: true });
      expect(await fs.readFile(datei("export.html"), "utf-8")).toBe(
        "<p>allgemein</p>",
      );
      expect(fileDialog.suggestedFilenames).toEqual([
        "Rechnungsvorlage NHP.html",
      ]);
    });

    it("sollte nichts sichern, wenn der Nutzer abbricht", async () => {
      const { service } = createService();

      const status = await service.rechnungsvorlageExportieren({});

      expect(status).toEqual({ completed: false });
    });

    it("sollte erklären, warum die Datei nicht gesichert wurde", async () => {
      const fileDialog = new FakeTemplateFileDialog({
        exportFile: datei("fehlt/export.html"),
      });
      const { service } = createService({ fileDialog });

      const status = await service.rechnungsvorlageExportieren({});

      expect(status).toEqual({
        completed: false,
        errorMessage: expect.stringContaining(
          "Bitte wählen Sie einen Speicherort",
        ),
      });
    });

    it("sollte die Vorlage einer unbekannten Praxis nicht exportieren", async () => {
      const fileDialog = new FakeTemplateFileDialog({
        exportFile: datei("export.html"),
      });
      const { service } = createService({ fileDialog });

      const status = await service.rechnungsvorlageExportieren({
        praxiskuerzel: "XYZ",
      });

      expect(status).toEqual({
        completed: false,
        errorMessage: expect.stringContaining("Die Praxis „XYZ“ gibt es nicht"),
      });
      expect(fileDialog.suggestedFilenames).toEqual([]);
    });
  });

  describe("Rechnungsvorlage importieren", () => {
    it("sollte die Datei als eigene Vorlage der Praxis sichern", async () => {
      await fs.writeFile(datei("import.html"), "<p>{{patient.name}}</p>");
      const { service, templateStore } = createService({
        fileDialog: new FakeTemplateFileDialog({
          importFile: datei("import.html"),
        }),
      });

      const status = await service.rechnungsvorlageImportieren({
        praxiskuerzel: "NHP",
      });

      expect(status).toEqual({ completed: true });
      expect(templateStore.find("rechnung", { praxiskuerzel: "NHP" })).toBe(
        "<p>{{patient.name}}</p>",
      );
      expect(templateStore.find("rechnung")).toBeUndefined();
    });

    it("sollte eine Vorlage mit fehlerhaften Platzhaltern ablehnen", async () => {
      await fs.writeFile(datei("import.html"), "{{#positionen}}");
      const { service, templateStore } = createService({
        fileDialog: new FakeTemplateFileDialog({
          importFile: datei("import.html"),
        }),
      });
      templateStore.save("rechnung", "<p>bisher</p>");

      const status = await service.rechnungsvorlageImportieren({});

      expect(status).toEqual({
        completed: false,
        errorMessage: expect.stringContaining(
          "Die Platzhalter der Rechnungsvorlage sind fehlerhaft",
        ),
      });
      expect(templateStore.find("rechnung")).toBe("<p>bisher</p>");
    });

    it("sollte erklären, warum die Datei nicht gelesen wurde", async () => {
      const { service } = createService({
        fileDialog: new FakeTemplateFileDialog({
          importFile: datei("fehlt.html"),
        }),
      });

      const status = await service.rechnungsvorlageImportieren({});

      expect(status).toEqual({
        completed: false,
        errorMessage: expect.stringContaining("konnte nicht gelesen werden"),
      });
    });

    it("sollte nichts ändern, wenn der Nutzer abbricht", async () => {
      const { service, templateStore } = createService();

      const status = await service.rechnungsvorlageImportieren({});

      expect(status).toEqual({ completed: false });
      expect(templateStore.scopes("rechnung")).toEqual([]);
    });
  });

  describe("Rechnungsvorlage zurücksetzen", () => {
    it("sollte die eigene Vorlage der Praxis entfernen, damit sie die allgemeine nutzt", async () => {
      const { service, templateStore } = createService();
      templateStore.save("rechnung", "<p>allgemein</p>");
      templateStore.save("rechnung", "<p>NHP</p>", { praxiskuerzel: "NHP" });

      const status = await service.rechnungsvorlageZuruecksetzen({
        praxiskuerzel: "NHP",
      });

      expect(status).toEqual({ completed: true });
      expect(service.geltendeVorlage({ praxiskuerzel: "NHP" })).toBe(
        "<p>allgemein</p>",
      );
    });

    it("sollte die allgemeine Vorlage auf die Standardvorlage zurücksetzen", async () => {
      const { service, templateStore } = createService();
      templateStore.save("rechnung", "<p>allgemein</p>");
      templateStore.save("rechnung", "<p>NHP</p>", { praxiskuerzel: "NHP" });

      await service.rechnungsvorlageZuruecksetzen({});

      expect(service.geltendeVorlage({})).toBe(standardvorlage);
      expect(service.geltendeVorlage({ praxiskuerzel: "NHP" })).toBe(
        "<p>NHP</p>",
      );
    });
  });

  describe("Vorschau ermitteln", () => {
    it("sollte die geltende Vorlage mit den Daten der Praxis liefern", async () => {
      const { service, templateStore } = createService();
      templateStore.save("rechnung", "<p>NHP</p>", { praxiskuerzel: "NHP" });

      const vorschau = await service.vorschauErmitteln({
        praxiskuerzel: "NHP",
      });

      expect(vorschau?.vorlage).toBe("<p>NHP</p>");
      expect(vorschau?.praxis?.name).toBe("Naturheilpraxis am Markt");
    });

    it("sollte die allgemeine Vorlage mit den Daten der ersten Praxis zeigen", async () => {
      const { service } = createService();

      const vorschau = await service.vorschauErmitteln({});

      expect(vorschau).toEqual({
        vorlage: standardvorlage,
        praxis: expect.objectContaining({ praxiskuerzel: "ABC" }),
      });
    });

    it("sollte die allgemeine Vorlage auch ohne Praxis zeigen", async () => {
      const { service } = createService({ events: [] });

      const vorschau = await service.vorschauErmitteln({});

      expect(vorschau).toEqual({ vorlage: standardvorlage });
    });

    it("sollte die Vorschau unter der Adresse finden, die die UI nutzt", () => {
      expect(resolveVorlagengeltung(rechnungsvorlageUrl({}))).toEqual({});
      expect(
        resolveVorlagengeltung(rechnungsvorlageUrl({ praxiskuerzel: "N/P" })),
      ).toEqual({ praxiskuerzel: "N/P" });
    });

    it("sollte keine Vorschau für eine unbekannte Praxis liefern", async () => {
      const { service } = createService();

      const vorschau = await service.vorschauErmitteln({
        praxiskuerzel: "XYZ",
      });

      expect(vorschau).toBeUndefined();
    });
  });
});

class FakeTemplateFileDialog implements TemplateFileDialog {
  readonly suggestedFilenames: string[] = [];
  readonly #exportFile: string | undefined;
  readonly #importFile: string | undefined;

  constructor({
    exportFile,
    importFile,
  }: { exportFile?: string; importFile?: string } = {}) {
    this.#exportFile = exportFile;
    this.#importFile = importFile;
  }

  chooseTemplateToExport(filename: string): Promise<string | undefined> {
    this.suggestedFilenames.push(filename);
    return Promise.resolve(this.#exportFile);
  }

  chooseTemplateToImport(): Promise<string | undefined> {
    return Promise.resolve(this.#importFile);
  }
}

function createService({
  events = createPraxen(),
  fileDialog = new FakeTemplateFileDialog(),
}: { events?: DomainEvent[]; fileDialog?: TemplateFileDialog } = {}) {
  const eventStore = SqliteEventStore.createInMemory();
  eventStore.append(events);
  const templateStore = SqliteTemplateStore.createInMemory();
  const service = new RechnungsvorlagenService({
    naturheilpraxis: new NaturheilpraxisService(eventStore),
    templateStore,
    fileDialog,
    standardvorlage,
  });
  return { service, templateStore };
}

function createPraxen(): DomainEvent[] {
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
      },
    },
    {
      type: "praxis-angelegt",
      data: {
        praxiskuerzel: "ABC",
        name: "Naturheilpraxis am Bahnhof",
        anschrift: {
          strasse: "Bahnhofstraße 2",
          postleitzahl: "12345",
          ort: "Musterstadt",
        },
      },
    },
  ];
}
