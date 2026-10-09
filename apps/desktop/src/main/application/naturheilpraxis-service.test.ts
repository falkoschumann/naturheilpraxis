// Copyright (c) 2026 Falko Schumann. MIT license.

import { describe, expect, it } from "vitest";

import type { Praxis } from "../../shared/domain/entities.ts";
import { SqliteEventStore } from "../infrastructure/event-store.ts";
import { NaturheilpraxisService } from "./naturheilpraxis-service.ts";

describe("Naturheilpraxis Service", () => {
  describe("Praxis anlegen", () => {
    it("sollte die Praxis speichern und in der Praxenansicht zeigen", async () => {
      const eventStore = SqliteEventStore.createInMemory();
      const service = new NaturheilpraxisService(eventStore);

      const status = await service.praxisAnlegen({
        type: "praxis-anlegen",
        data: createPraxis(),
      });

      expect(status).toEqual({ success: true });
      expect(eventStore.query()).toEqual([
        { type: "praxis-angelegt", data: createPraxis() },
      ]);
      expect(
        await service.praxenErmitteln({
          type: "praxen-ermitteln",
          parameters: {},
        }),
      ).toEqual([
        {
          praxiskuerzel: "NHP",
          name: "Naturheilpraxis am Markt",
          strasse: "Marktplatz 1",
          postleitzahl: "12345",
          ort: "Musterstadt",
        },
      ]);
    });

    it("sollte eine Fehlermeldung liefern und nichts speichern, wenn das Kürzel vergeben ist", async () => {
      const eventStore = SqliteEventStore.createInMemory();
      eventStore.append([{ type: "praxis-angelegt", data: createPraxis() }]);
      const service = new NaturheilpraxisService(eventStore);

      const status = await service.praxisAnlegen({
        type: "praxis-anlegen",
        data: createPraxis({ name: "Andere Praxis" }),
      });

      expect(status).toEqual({
        success: false,
        errorMessage:
          "Eine Praxis mit dem Kürzel „NHP“ ist bereits angelegt. Bitte wählen Sie ein anderes Kürzel.",
      });
      expect(eventStore.query()).toHaveLength(1);
    });
  });

  describe("Praxisdaten ändern", () => {
    it("sollte die geänderten Praxisdaten zeigen", async () => {
      const eventStore = SqliteEventStore.createInMemory();
      eventStore.append([{ type: "praxis-angelegt", data: createPraxis() }]);
      const service = new NaturheilpraxisService(eventStore);

      const status = await service.praxisdatenAendern({
        type: "praxisdaten-aendern",
        data: createPraxis({ name: "Naturheilpraxis am Brunnen" }),
      });

      expect(status).toEqual({ success: true });
      expect(
        await service.praxisErmitteln({
          type: "praxis-ermitteln",
          parameters: { praxiskuerzel: "NHP" },
        }),
      ).toEqual(createPraxis({ name: "Naturheilpraxis am Brunnen" }));
    });
  });

  describe("Praxis ermitteln", () => {
    it("sollte die Praxis aus den gespeicherten Events ermitteln", async () => {
      const eventStore = SqliteEventStore.createInMemory();
      eventStore.append([{ type: "praxis-angelegt", data: createPraxis() }]);
      const service = new NaturheilpraxisService(eventStore);

      const praxis = await service.praxisErmitteln({
        type: "praxis-ermitteln",
        parameters: { praxiskuerzel: "NHP" },
      });

      expect(praxis).toEqual(createPraxis());
    });
  });

  describe("Gebührenverzeichnis", () => {
    it("sollte eine angelegte Gebühr im Gebührenverzeichnis zeigen", async () => {
      const service = new NaturheilpraxisService(
        SqliteEventStore.createInMemory(),
      );

      const status = await service.gebuehrAnlegen({
        type: "gebuehr-anlegen",
        data: {
          ziffer: "1",
          bezeichnung: "Eingehende Untersuchung",
          betrag: { cents: 2050 },
        },
      });

      expect(status).toEqual({ success: true });
      expect(
        await service.gebuehrenErmitteln({
          type: "gebuehren-ermitteln",
          parameters: {},
        }),
      ).toEqual([
        {
          ziffer: "1",
          bezeichnung: "Eingehende Untersuchung",
          betrag: { cents: 2050 },
        },
      ]);
    });

    it("sollte eine geänderte Gebühr im Gebührenverzeichnis zeigen", async () => {
      const eventStore = SqliteEventStore.createInMemory();
      eventStore.append([
        {
          type: "gebuehr-angelegt",
          data: {
            ziffer: "1",
            bezeichnung: "Eingehende Untersuchung",
            betrag: { cents: 2050 },
          },
        },
      ]);
      const service = new NaturheilpraxisService(eventStore);

      const status = await service.gebuehrAendern({
        type: "gebuehr-aendern",
        data: {
          ziffer: "1",
          bezeichnung: "Eingehende Untersuchung",
          betrag: { cents: 2300 },
        },
      });

      expect(status).toEqual({ success: true });
      expect(
        await service.gebuehrenErmitteln({
          type: "gebuehren-ermitteln",
          parameters: {},
        }),
      ).toEqual([
        {
          ziffer: "1",
          bezeichnung: "Eingehende Untersuchung",
          betrag: { cents: 2300 },
        },
      ]);
    });

    it("sollte eine entfernte Gebühr nicht mehr zeigen", async () => {
      const eventStore = SqliteEventStore.createInMemory();
      eventStore.append([
        {
          type: "gebuehr-angelegt",
          data: {
            ziffer: "1",
            bezeichnung: "Eingehende Untersuchung",
            betrag: { cents: 2050 },
          },
        },
      ]);
      const service = new NaturheilpraxisService(eventStore);

      const status = await service.gebuehrEntfernen({
        type: "gebuehr-entfernen",
        data: { ziffer: "1" },
      });

      expect(status).toEqual({ success: true });
      expect(
        await service.gebuehrenErmitteln({
          type: "gebuehren-ermitteln",
          parameters: {},
        }),
      ).toEqual([]);
    });

    it("sollte eine Fehlermeldung liefern, wenn der Betrag negativ ist", async () => {
      const service = new NaturheilpraxisService(
        SqliteEventStore.createInMemory(),
      );

      const status = await service.gebuehrAnlegen({
        type: "gebuehr-anlegen",
        data: {
          ziffer: "1",
          bezeichnung: "Eingehende Untersuchung",
          betrag: { cents: -1 },
        },
      });

      expect(status).toEqual({
        success: false,
        errorMessage:
          "Der Betrag darf nicht negativ sein. Bitte geben Sie einen Betrag ab 0,00 € an.",
      });
    });
  });
});

function createPraxis(praxis: Partial<Praxis> = {}): Praxis {
  return {
    praxiskuerzel: "NHP",
    name: "Naturheilpraxis am Markt",
    anschrift: {
      strasse: "Marktplatz 1",
      postleitzahl: "12345",
      ort: "Musterstadt",
    },
    ...praxis,
  };
}
