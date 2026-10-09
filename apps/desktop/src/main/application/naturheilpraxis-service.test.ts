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

  describe("Patienten", () => {
    it("sollte einen Patienten mit der nächsten Nummer aufnehmen", async () => {
      const eventStore = SqliteEventStore.createInMemory();
      eventStore.append([{ type: "praxis-angelegt", data: createPraxis() }]);
      const service = new NaturheilpraxisService(eventStore);

      const status = await service.patientAufnehmen({
        type: "patient-aufnehmen",
        data: {
          praxiskuerzel: "NHP",
          aufnahmejahr: 2026,
          geburtsdatum: "1980-09-20",
          name: { vorname: "Max", nachname: "Mustermann" },
        },
      });

      expect(status).toEqual({ success: true, patientennummer: 1 });
      expect(
        await service.patientenErmitteln({
          type: "patienten-ermitteln",
          parameters: {},
        }),
      ).toEqual([
        {
          patientennummer: 1,
          praxiskuerzel: "NHP",
          aufnahmejahr: 2026,
          geburtsdatum: "1980-09-20",
          vorname: "Max",
          nachname: "Mustermann",
        },
      ]);
    });

    it("sollte eine Fehlermeldung liefern, wenn die Praxis nicht angelegt ist", async () => {
      const service = new NaturheilpraxisService(
        SqliteEventStore.createInMemory(),
      );

      const status = await service.patientAufnehmen({
        type: "patient-aufnehmen",
        data: {
          praxiskuerzel: "NHP",
          aufnahmejahr: 2026,
          geburtsdatum: "1980-09-20",
          name: { vorname: "Max", nachname: "Mustermann" },
        },
      });

      expect(status).toEqual({
        success: false,
        errorMessage:
          "Die Praxis „NHP“ ist nicht angelegt. Bitte wählen Sie eine angelegte Praxis.",
      });
    });

    it("sollte die geänderten Patientendaten zeigen", async () => {
      const eventStore = SqliteEventStore.createInMemory();
      const max = {
        patientennummer: 1,
        praxiskuerzel: "NHP",
        aufnahmejahr: 2026,
        geburtsdatum: "1980-09-20",
        name: { vorname: "Max", nachname: "Mustermann" },
      };
      eventStore.append([
        { type: "praxis-angelegt", data: createPraxis() },
        { type: "patient-aufgenommen", data: max },
      ]);
      const service = new NaturheilpraxisService(eventStore);

      const status = await service.patientendatenAendern({
        type: "patientendaten-aendern",
        data: { ...max, beruf: "Tischler" },
      });

      expect(status).toEqual({ success: true });
      expect(
        await service.patientErmitteln({
          type: "patient-ermitteln",
          parameters: { patientennummer: 1 },
        }),
      ).toEqual({ ...max, beruf: "Tischler" });
    });
  });

  describe("Diagnosen", () => {
    it("sollte gestellte, geänderte und gelöschte Diagnosen in der Behandlung zeigen", async () => {
      const eventStore = SqliteEventStore.createInMemory();
      eventStore.append([
        { type: "praxis-angelegt", data: createPraxis() },
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
      ]);
      const service = new NaturheilpraxisService(eventStore);
      const diagnose = {
        diagnoseId: "11111111-1111-4111-8111-111111111111",
        praxiskuerzel: "NHP",
        patientennummer: 1,
        datum: "2026-09-14",
        text: "Rückenschmerzen",
      };

      const gestellt = await service.diagnoseStellen({
        type: "diagnose-stellen",
        data: diagnose,
      });
      const geaendert = await service.diagnoseAendern({
        type: "diagnose-aendern",
        data: {
          diagnoseId: diagnose.diagnoseId,
          praxiskuerzel: "NHP",
          datum: "2026-09-14",
          text: "Lumbago",
        },
      });

      expect([gestellt, geaendert]).toEqual([
        { success: true },
        { success: true },
      ]);
      expect(
        await service.behandlungenErmitteln({
          type: "behandlungen-ermitteln",
          parameters: { patientennummer: 1 },
        }),
      ).toEqual([
        { art: "diagnose", eintrag: { ...diagnose, text: "Lumbago" } },
      ]);

      const geloescht = await service.diagnoseLoeschen({
        type: "diagnose-loeschen",
        data: { diagnoseId: diagnose.diagnoseId },
      });

      expect(geloescht).toEqual({ success: true });
      expect(
        await service.diagnosenErmitteln({
          type: "diagnosen-ermitteln",
          parameters: { patientennummer: 1 },
        }),
      ).toEqual([]);
    });
  });

  describe("Leistungen", () => {
    it("sollte erbrachte, geänderte und gelöschte Leistungen in der Behandlung zeigen", async () => {
      const eventStore = SqliteEventStore.createInMemory();
      eventStore.append([
        { type: "praxis-angelegt", data: createPraxis() },
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
      ]);
      const service = new NaturheilpraxisService(eventStore);
      const leistung = {
        leistungId: "22222222-2222-4222-8222-222222222222",
        praxiskuerzel: "NHP",
        patientennummer: 1,
        datum: "2026-09-14",
        ziffer: "1",
        bezeichnung: "Eingehende Untersuchung",
        anzahl: 1,
        einzelbetrag: { cents: 2050 },
      };

      const erbracht = await service.leistungErbringen({
        type: "leistung-erbringen",
        data: leistung,
      });
      const geaendert = await service.leistungAendern({
        type: "leistung-aendern",
        data: {
          leistungId: leistung.leistungId,
          praxiskuerzel: "NHP",
          datum: "2026-09-14",
          ziffer: "1",
          bezeichnung: "Eingehende Untersuchung",
          anzahl: 2,
          einzelbetrag: { cents: 2050 },
        },
      });

      expect([erbracht, geaendert]).toEqual([
        { success: true },
        { success: true },
      ]);
      expect(
        await service.behandlungenErmitteln({
          type: "behandlungen-ermitteln",
          parameters: { patientennummer: 1 },
        }),
      ).toEqual([{ art: "leistung", eintrag: { ...leistung, anzahl: 2 } }]);

      const geloescht = await service.leistungLoeschen({
        type: "leistung-loeschen",
        data: { leistungId: leistung.leistungId },
      });

      expect(geloescht).toEqual({ success: true });
      expect(
        await service.behandlungenErmitteln({
          type: "behandlungen-ermitteln",
          parameters: { patientennummer: 1 },
        }),
      ).toEqual([]);
    });
  });

  describe("Abrechnung", () => {
    const leistung = (leistungId: string) => ({
      leistungId,
      praxiskuerzel: "NHP",
      patientennummer: 1,
      datum: "2026-09-14",
      ziffer: "1",
      bezeichnung: "Eingehende Untersuchung",
      anzahl: 1,
      einzelbetrag: { cents: 2050 },
    });
    const ersteLeistung = "22222222-2222-4222-8222-222222222222";
    const zweiteLeistung = "23232323-2323-4323-8323-232323232323";
    const rechnungId = "33333333-3333-4333-8333-333333333333";

    function createService() {
      const eventStore = SqliteEventStore.createInMemory();
      eventStore.append([
        {
          type: "praxis-angelegt",
          data: createPraxis({ rechnungstext: "Zahlbar in 14 Tagen." }),
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
        { type: "leistung-erbracht", data: leistung(ersteLeistung) },
        { type: "leistung-erbracht", data: leistung(zweiteLeistung) },
      ]);
      return new NaturheilpraxisService(eventStore);
    }

    it("sollte eine Rechnung erstellen und die abgerechneten Leistungen nicht mehr anbieten", async () => {
      const service = createService();

      const status = await service.rechnungErstellen({
        type: "rechnung-erstellen",
        data: {
          rechnungId,
          praxiskuerzel: "NHP",
          patientennummer: 1,
          diagnosetext: "Rückenschmerzen",
          rechnungstext: "Zahlbar in 14 Tagen.",
          leistungen: [ersteLeistung],
        },
      });

      expect(status).toEqual({ success: true });
      expect(
        await service.nichtAbgerechneteLeistungenErmitteln({
          type: "nicht-abgerechnete-leistungen-ermitteln",
          parameters: { patientennummer: 1 },
        }),
      ).toEqual([leistung(zweiteLeistung)]);
      expect(
        await service.rechnungenErmitteln({
          type: "rechnungen-ermitteln",
          parameters: {},
        }),
      ).toEqual([
        {
          rechnungId,
          praxiskuerzel: "NHP",
          patientennummer: 1,
          patientenname: "Mustermann, Max (Nr. 1), geboren am 20.09.1980",
          diagnosetext: "Rückenschmerzen",
          rechnungstext: "Zahlbar in 14 Tagen.",
          status: "entwurf",
        },
      ]);
      expect(
        await service.rechnungErmitteln({
          type: "rechnung-ermitteln",
          parameters: { rechnungId },
        }),
      ).toMatchObject({ status: "entwurf", gesamtbetrag: { cents: 2050 } });
    });

    it("sollte eine aus dem Entwurf entfernte Leistung wieder löschen lassen", async () => {
      const service = createService();
      await service.rechnungErstellen({
        type: "rechnung-erstellen",
        data: {
          rechnungId,
          praxiskuerzel: "NHP",
          patientennummer: 1,
          diagnosetext: "Rückenschmerzen",
          rechnungstext: "Zahlbar in 14 Tagen.",
          leistungen: [ersteLeistung, zweiteLeistung],
        },
      });
      const imEntwurf = await service.leistungLoeschen({
        type: "leistung-loeschen",
        data: { leistungId: ersteLeistung },
      });

      await service.rechnungAendern({
        type: "rechnung-aendern",
        data: {
          rechnungId,
          praxiskuerzel: "NHP",
          diagnosetext: "Rückenschmerzen",
          rechnungstext: "Zahlbar in 14 Tagen.",
          leistungen: [zweiteLeistung],
        },
      });
      const entfernt = await service.leistungLoeschen({
        type: "leistung-loeschen",
        data: { leistungId: ersteLeistung },
      });

      expect(imEntwurf.success).toBe(false);
      expect(entfernt).toEqual({ success: true });
    });

    it("sollte einen gelöschten Entwurf nicht mehr zeigen", async () => {
      const service = createService();
      await service.rechnungErstellen({
        type: "rechnung-erstellen",
        data: {
          rechnungId,
          praxiskuerzel: "NHP",
          patientennummer: 1,
          diagnosetext: "Rückenschmerzen",
          rechnungstext: "Zahlbar in 14 Tagen.",
          leistungen: [ersteLeistung],
        },
      });

      const status = await service.entwurfLoeschen({
        type: "entwurf-loeschen",
        data: { rechnungId },
      });

      expect(status).toEqual({ success: true });
      expect(
        await service.rechnungenErmitteln({
          type: "rechnungen-ermitteln",
          parameters: {},
        }),
      ).toEqual([]);
      expect(
        await service.leistungLoeschen({
          type: "leistung-loeschen",
          data: { leistungId: ersteLeistung },
        }),
      ).toEqual({ success: true });
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
