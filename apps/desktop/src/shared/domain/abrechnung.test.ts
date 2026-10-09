// Copyright (c) 2026 Falko Schumann. MIT license.

import { describe, expect, it } from "vitest";

import {
  consults,
  decide,
  evolveAll,
  initialState,
  tags,
  type AbrechnungDcbEvent,
  type RechnungErstellenCommand,
} from "./abrechnung.ts";

const leistungId = "22222222-2222-4222-8222-222222222222";
const rechnungId = "33333333-3333-4333-8333-333333333333";
const andereRechnungId = "34343434-3434-4434-8434-343434343434";

describe("Abrechnung", () => {
  describe("Rechnung erstellen", () => {
    it("sollte Rechnung erstellen", () => {
      const state = evolveAll(initialState, [
        praxisAngelegt(),
        maxAufgenommen(),
        leistungErbracht(),
      ]);

      const result = decide(state, erstellen());

      expect(result).toEqual({
        ok: true,
        value: [{ type: "rechnung-erstellt", data: erstellen().data }],
      });
    });

    it("sollte Rechnung nicht für unbekannte Praxis erstellen", () => {
      const state = evolveAll(initialState, [
        maxAufgenommen(),
        leistungErbracht(),
      ]);

      const result = decide(state, erstellen({ praxiskuerzel: "XYZ" }));

      expect(result).toEqual({
        ok: false,
        error: {
          invariant: "praxis-existiert",
          message:
            "Die Praxis „XYZ“ ist nicht angelegt. Bitte wählen Sie eine angelegte Praxis.",
        },
      });
    });

    it("sollte Rechnung nicht für unbekannten Patienten erstellen", () => {
      const state = evolveAll(initialState, [
        praxisAngelegt(),
        leistungErbracht(),
      ]);

      const result = decide(state, erstellen({ patientennummer: 7 }));

      expect(result).toEqual({
        ok: false,
        error: {
          invariant: "patient-existiert",
          message:
            "Der Patient mit der Nummer 7 ist nicht aufgenommen. Bitte wählen Sie einen aufgenommenen Patienten.",
        },
      });
    });

    it("sollte Rechnung nicht mit gelöschter Leistung erstellen", () => {
      const state = evolveAll(initialState, [
        praxisAngelegt(),
        maxAufgenommen(),
        leistungErbracht(),
        { type: "leistung-geloescht", data: { leistungId } },
      ]);

      const result = decide(state, erstellen());

      expect(result).toEqual({
        ok: false,
        error: {
          invariant: "leistungen-existieren",
          message:
            "Eine der Leistungen ist nicht vorhanden, möglicherweise wurde sie inzwischen gelöscht. Bitte wählen Sie die Leistungen erneut aus.",
        },
      });
    });

    it("sollte Rechnung nicht mit Leistung eines anderen Patienten erstellen", () => {
      const state = evolveAll(initialState, [
        praxisAngelegt(),
        maxAufgenommen(),
        leistungErbracht(2),
      ]);

      const result = decide(state, erstellen());

      expect(result).toEqual({
        ok: false,
        error: {
          invariant: "leistungen-des-patienten",
          message:
            "Eine der Leistungen gehört zu einem anderen Patienten. Bitte wählen Sie nur Leistungen des Patienten der Rechnung aus.",
        },
      });
    });

    it("sollte bereits abgerechnete Leistung nicht erneut abrechnen", () => {
      const state = evolveAll(initialState, [
        praxisAngelegt(),
        maxAufgenommen(),
        leistungErbracht(),
        rechnungErstellt(),
      ]);

      const result = decide(state, erstellen({ rechnungId: andereRechnungId }));

      expect(result).toEqual({
        ok: false,
        error: {
          invariant: "leistungen-nicht-abgerechnet",
          message:
            "Eine der Leistungen ist bereits in einer anderen Rechnung enthalten. Bitte wählen Sie nur nicht abgerechnete Leistungen aus.",
        },
      });
    });

    it("sollte Leistung nach Löschen des Entwurfs erneut abrechnen", () => {
      const state = evolveAll(initialState, [
        praxisAngelegt(),
        maxAufgenommen(),
        leistungErbracht(),
        rechnungErstellt(),
        { type: "entwurf-geloescht", data: { rechnungId } },
      ]);

      const result = decide(state, erstellen({ rechnungId: andereRechnungId }));

      expect(result).toEqual({
        ok: true,
        value: [
          {
            type: "rechnung-erstellt",
            data: erstellen({ rechnungId: andereRechnungId }).data,
          },
        ],
      });
    });

    it("sollte Rechnung ohne Leistungen nicht erstellen", () => {
      const state = evolveAll(initialState, [
        praxisAngelegt(),
        maxAufgenommen(),
      ]);

      const result = decide(state, erstellen({ leistungen: [] }));

      expect(result).toEqual({
        ok: false,
        error: {
          message:
            "Eine Rechnung enthält mindestens eine Leistung. Bitte wählen Sie Leistungen aus.",
        },
      });
    });

    // The model leaves out rules that follow from identity.
    it("sollte Rechnung nicht zweimal erstellen", () => {
      const state = evolveAll(initialState, [
        praxisAngelegt(),
        maxAufgenommen(),
        leistungErbracht(),
        rechnungErstellt(),
      ]);

      const result = decide(state, erstellen());

      expect(result).toEqual({
        ok: false,
        error: { message: "Die Rechnung ist bereits erstellt." },
      });
    });

    it("sollte die Rechnung, die Leistungen, die Praxis und den Patienten konsultieren", () => {
      const query = consults(erstellen());

      expect(query).toEqual([
        {
          types: [
            "rechnung-erstellt",
            "rechnung-geaendert",
            "entwurf-geloescht",
            "rechnung-versendet",
            "rechnung-bezahlt",
            "rechnungszahlung-zurueckgenommen",
            "rechnungsversand-zurueckgenommen",
          ],
          tags: [`rechnung:${rechnungId}`],
        },
        {
          types: [
            "rechnung-erstellt",
            "rechnung-geaendert",
            "entwurf-geloescht",
            "leistung-erbracht",
            "leistung-geaendert",
            "leistung-geloescht",
          ],
          tags: [`leistung:${leistungId}`],
        },
        { types: ["praxis-angelegt"], tags: ["praxis:NHP"] },
        { types: ["patient-aufgenommen"], tags: ["patient:1"] },
      ]);
    });
  });

  describe("Rechnung ändern", () => {
    it("sollte Entwurf ändern", () => {
      const state = evolveAll(initialState, [
        praxisAngelegt(),
        leistungErbracht(),
        rechnungErstellt(),
      ]);

      const result = decide(state, aendern());

      expect(result).toEqual({
        ok: true,
        value: [{ type: "rechnung-geaendert", data: aendern().data }],
      });
    });

    it("sollte versendete Rechnung nicht ändern", () => {
      const state = evolveAll(initialState, [
        praxisAngelegt(),
        leistungErbracht(),
        rechnungErstellt(),
        rechnungVersendet(),
      ]);

      const result = decide(state, aendern());

      expect(result).toEqual({
        ok: false,
        error: {
          invariant: "nur-im-entwurf-aendern",
          message:
            "Die Rechnung ist bereits versendet und kann nicht mehr geändert werden. Nehmen Sie zuerst den Versand zurück.",
        },
      });
    });

    it("sollte Rechnung nicht ändern, wenn sie nicht vorhanden ist", () => {
      const state = evolveAll(initialState, [
        praxisAngelegt(),
        leistungErbracht(),
      ]);

      const result = decide(state, aendern());

      expect(result).toEqual({
        ok: false,
        error: {
          message:
            "Die Rechnung ist nicht vorhanden. Möglicherweise wurde sie inzwischen gelöscht.",
        },
      });
    });

    it("sollte die Rechnung zusätzlich mit den entfernten Leistungen taggen", () => {
      const state = evolveAll(initialState, [
        praxisAngelegt(),
        leistungErbracht(),
        rechnungErstellt(),
      ]);

      const zusaetzlich = tags(state, {
        type: "rechnung-geaendert",
        data: {
          ...aendern().data,
          leistungen: ["99999999-9999-4999-8999-999999999999"],
        },
      });

      expect(zusaetzlich).toEqual([`leistung:${leistungId}`]);
    });
  });

  describe("Entwurf löschen", () => {
    it("sollte Entwurf löschen", () => {
      const state = evolveAll(initialState, [rechnungErstellt()]);

      const result = decide(state, {
        type: "entwurf-loeschen",
        data: { rechnungId },
      });

      expect(result).toEqual({
        ok: true,
        value: [{ type: "entwurf-geloescht", data: { rechnungId } }],
      });
    });

    it("sollte versendete Rechnung nicht löschen", () => {
      const state = evolveAll(initialState, [
        rechnungErstellt(),
        rechnungVersendet(),
      ]);

      const result = decide(state, {
        type: "entwurf-loeschen",
        data: { rechnungId },
      });

      expect(result).toEqual({
        ok: false,
        error: {
          invariant: "nur-im-entwurf-loeschen",
          message:
            "Die Rechnung ist bereits versendet und kann nicht gelöscht werden. Nehmen Sie zuerst den Versand zurück.",
        },
      });
    });

    it("sollte nichts ändern, wenn ein nicht vorhandener Entwurf gelöscht wird", () => {
      const state = evolveAll(initialState, []);

      const result = decide(state, {
        type: "entwurf-loeschen",
        data: { rechnungId },
      });

      expect(result).toEqual({ ok: true, value: [] });
    });

    it("sollte das Löschen mit den Leistungen des Entwurfs taggen", () => {
      const state = evolveAll(initialState, [rechnungErstellt()]);

      const zusaetzlich = tags(state, {
        type: "entwurf-geloescht",
        data: { rechnungId },
      });

      expect(zusaetzlich).toEqual([`leistung:${leistungId}`]);
    });
  });

  describe("Rechnung versenden", () => {
    it("sollte die erste Rechnung des Tages versenden", () => {
      const state = evolveAll(initialState, [
        maxMitAnschrift(),
        rechnungErstellt(),
      ]);

      const result = decide(state, versenden(rechnungId));

      expect(result).toEqual({
        ok: true,
        value: [
          {
            type: "rechnung-versendet",
            data: {
              rechnungId,
              patientennummer: 1,
              rechnungsnummer: "1/260920",
              datum: "2026-09-20",
            },
          },
        ],
      });
    });

    it("sollte der zweiten Rechnung des Tages eine fortlaufende Zahl anhängen", () => {
      const state = evolveAll(initialState, [
        maxMitAnschrift(),
        rechnungErstellt(),
        rechnungVersendet(),
        {
          type: "rechnung-erstellt",
          data: erstellen({ rechnungId: andereRechnungId }).data,
        },
      ]);

      const result = decide(state, versenden(andereRechnungId));

      expect(result).toEqual({
        ok: true,
        value: [
          {
            type: "rechnung-versendet",
            data: {
              rechnungId: andereRechnungId,
              patientennummer: 1,
              rechnungsnummer: "1/260920-2",
              datum: "2026-09-20",
            },
          },
        ],
      });
    });

    it("sollte eine frei gewordene Rechnungsnummer erneut vergeben", () => {
      const state = evolveAll(initialState, [
        maxMitAnschrift(),
        rechnungErstellt(),
        rechnungVersendet(),
        {
          type: "rechnung-erstellt",
          data: erstellen({ rechnungId: andereRechnungId }).data,
        },
        {
          type: "rechnung-versendet",
          data: {
            rechnungId: andereRechnungId,
            patientennummer: 1,
            rechnungsnummer: "1/260920-2",
            datum: "2026-09-20",
          },
        },
        {
          type: "rechnungsversand-zurueckgenommen",
          data: {
            rechnungId,
            patientennummer: 1,
            rechnungsnummer: "1/260920",
            datum: "2026-09-20",
          },
        },
      ]);

      const result = decide(state, versenden(rechnungId));

      expect(result).toEqual({
        ok: true,
        value: [
          {
            type: "rechnung-versendet",
            data: {
              rechnungId,
              patientennummer: 1,
              rechnungsnummer: "1/260920",
              datum: "2026-09-20",
            },
          },
        ],
      });
    });

    it("sollte eine versendete Rechnung nicht erneut versenden", () => {
      const state = evolveAll(initialState, [
        maxMitAnschrift(),
        rechnungErstellt(),
        rechnungVersendet(),
      ]);

      const result = decide(state, {
        ...versenden(rechnungId),
        data: { ...versenden(rechnungId).data, datum: "2026-09-21" },
      });

      expect(result).toEqual({
        ok: false,
        error: {
          invariant: "nur-entwurf-versenden",
          message:
            "Die Rechnung ist bereits versendet. Um sie erneut zu versenden, nehmen Sie zuerst den Versand zurück.",
        },
      });
    });

    it("sollte eine Rechnung nicht mit falschem Patienten versenden", () => {
      const state = evolveAll(initialState, [
        maxMitAnschrift(),
        rechnungErstellt(),
      ]);

      const result = decide(state, {
        ...versenden(rechnungId),
        data: { ...versenden(rechnungId).data, patientennummer: 2 },
      });

      expect(result).toEqual({
        ok: false,
        error: {
          invariant: "patient-der-rechnung",
          message:
            "Die Rechnung gehört zu einem anderen Patienten. Bitte versenden Sie sie von dessen Karteikarte aus.",
        },
      });
    });

    it("sollte eine Rechnung ohne Rechnungsanschrift nicht versenden", () => {
      const state = evolveAll(initialState, [
        maxAufgenommen(),
        rechnungErstellt(),
      ]);

      const result = decide(state, versenden(rechnungId));

      expect(result).toEqual({
        ok: false,
        error: {
          invariant: "rechnungsanschrift-vorhanden",
          message:
            "Die Rechnung kann nicht versendet werden, weil die Anschrift des Patienten fehlt. Bitte ergänzen Sie Straße, Postleitzahl und Ort in den Stammdaten.",
        },
      });
    });

    it("sollte eine nicht vorhandene Rechnung nicht versenden", () => {
      const state = evolveAll(initialState, [maxMitAnschrift()]);

      const result = decide(state, versenden(rechnungId));

      expect(result).toEqual({
        ok: false,
        error: {
          message:
            "Die Rechnung ist nicht vorhanden. Möglicherweise wurde sie inzwischen gelöscht.",
        },
      });
    });

    it("sollte die Rechnung, die Rechnungen des Patienten am selben Tag und den Patienten konsultieren", () => {
      const query = consults(versenden(rechnungId));

      expect(query).toEqual([
        {
          types: [
            "rechnung-erstellt",
            "rechnung-geaendert",
            "entwurf-geloescht",
            "rechnung-versendet",
            "rechnung-bezahlt",
            "rechnungszahlung-zurueckgenommen",
            "rechnungsversand-zurueckgenommen",
          ],
          tags: [`rechnung:${rechnungId}`],
        },
        {
          types: ["rechnung-versendet", "rechnungsversand-zurueckgenommen"],
          tags: ["rechnungstag:1/2026-09-20"],
        },
        {
          types: ["patient-aufgenommen", "patientendaten-geaendert"],
          tags: ["patient:1"],
        },
      ]);
    });

    it("sollte den Versand mit den Leistungen der Rechnung taggen", () => {
      const state = evolveAll(initialState, [
        maxMitAnschrift(),
        rechnungErstellt(),
      ]);

      const zusaetzlich = tags(state, {
        type: "rechnung-versendet",
        data: {
          rechnungId,
          patientennummer: 1,
          rechnungsnummer: "1/260920",
          datum: "2026-09-20",
        },
      });

      expect(zusaetzlich).toEqual([`leistung:${leistungId}`]);
    });
  });

  describe("Zahlung erfassen", () => {
    it("sollte die Zahlung einer versendeten Rechnung erfassen", () => {
      const state = evolveAll(initialState, [
        rechnungErstellt(),
        rechnungVersendet(),
      ]);

      const result = decide(state, {
        type: "zahlung-erfassen",
        data: { rechnungId },
      });

      expect(result).toEqual({
        ok: true,
        value: [{ type: "rechnung-bezahlt", data: { rechnungId } }],
      });
    });

    it("sollte keine Zahlung für einen Entwurf erfassen", () => {
      const state = evolveAll(initialState, [rechnungErstellt()]);

      const result = decide(state, {
        type: "zahlung-erfassen",
        data: { rechnungId },
      });

      expect(result).toEqual({
        ok: false,
        error: {
          invariant: "nur-versendete-bezahlen",
          message:
            "Nur eine versendete Rechnung kann bezahlt werden. Bitte versenden Sie die Rechnung zuerst.",
        },
      });
    });

    it("sollte keine Zahlung für eine nicht vorhandene Rechnung erfassen", () => {
      const state = evolveAll(initialState, []);

      const result = decide(state, {
        type: "zahlung-erfassen",
        data: { rechnungId },
      });

      expect(result).toEqual({
        ok: false,
        error: {
          message:
            "Die Rechnung ist nicht vorhanden. Möglicherweise wurde sie inzwischen gelöscht.",
        },
      });
    });

    it("sollte nur die Rechnung konsultieren", () => {
      const query = consults({
        type: "zahlung-erfassen",
        data: { rechnungId },
      });

      expect(query).toEqual([
        {
          types: [
            "rechnung-erstellt",
            "rechnung-geaendert",
            "entwurf-geloescht",
            "rechnung-versendet",
            "rechnung-bezahlt",
            "rechnungszahlung-zurueckgenommen",
            "rechnungsversand-zurueckgenommen",
          ],
          tags: [`rechnung:${rechnungId}`],
        },
      ]);
    });
  });

  describe("Rechnung zurückstufen", () => {
    it("sollte den Versand zurücknehmen", () => {
      const state = evolveAll(initialState, [
        rechnungErstellt(),
        rechnungVersendet(),
      ]);

      const result = decide(state, {
        type: "rechnung-zurueckstufen",
        data: { rechnungId },
      });

      expect(result).toEqual({
        ok: true,
        value: [
          {
            type: "rechnungsversand-zurueckgenommen",
            data: {
              rechnungId,
              patientennummer: 1,
              rechnungsnummer: "1/260920",
              datum: "2026-09-20",
            },
          },
        ],
      });
    });

    it("sollte die Zahlung zurücknehmen", () => {
      const state = evolveAll(initialState, [
        rechnungErstellt(),
        rechnungVersendet(),
        { type: "rechnung-bezahlt", data: { rechnungId } },
      ]);

      const result = decide(state, {
        type: "rechnung-zurueckstufen",
        data: { rechnungId },
      });

      expect(result).toEqual({
        ok: true,
        value: [
          { type: "rechnungszahlung-zurueckgenommen", data: { rechnungId } },
        ],
      });
    });

    it("sollte einen Entwurf nicht zurückstufen", () => {
      const state = evolveAll(initialState, [rechnungErstellt()]);

      const result = decide(state, {
        type: "rechnung-zurueckstufen",
        data: { rechnungId },
      });

      expect(result).toEqual({
        ok: false,
        error: {
          invariant: "entwurf-nicht-zurueckstufen",
          message:
            "Die Rechnung ist ein Entwurf und wurde noch nicht versendet.",
        },
      });
    });
  });
});

function erstellen(
  data: Partial<RechnungErstellenCommand["data"]> = {},
): RechnungErstellenCommand {
  return {
    type: "rechnung-erstellen",
    data: {
      rechnungId,
      praxiskuerzel: "NHP",
      patientennummer: 1,
      diagnosetext: "Chronische Rückenschmerzen",
      rechnungstext: "Bitte überweisen Sie den Betrag innerhalb von 14 Tagen.",
      leistungen: [leistungId],
      ...data,
    },
  };
}

function aendern() {
  return {
    type: "rechnung-aendern" as const,
    data: {
      rechnungId,
      praxiskuerzel: "NHP",
      diagnosetext: "Chronische Rückenschmerzen im Lendenwirbelbereich",
      rechnungstext: "Bitte überweisen Sie den Betrag innerhalb von 14 Tagen.",
      leistungen: [leistungId],
    },
  };
}

function rechnungErstellt(): AbrechnungDcbEvent {
  return { type: "rechnung-erstellt", data: erstellen().data };
}

function rechnungVersendet(): AbrechnungDcbEvent {
  return {
    type: "rechnung-versendet",
    data: {
      rechnungId,
      patientennummer: 1,
      rechnungsnummer: "1/260920",
      datum: "2026-09-20",
    },
  };
}

function leistungErbracht(patientennummer = 1): AbrechnungDcbEvent {
  return {
    type: "leistung-erbracht",
    data: {
      leistungId,
      praxiskuerzel: "NHP",
      patientennummer,
      datum: "2026-09-14",
      ziffer: "1",
      bezeichnung: "Eingehende Untersuchung",
      anzahl: 1,
      einzelbetrag: { cents: 2050 },
    },
  };
}

function praxisAngelegt(): AbrechnungDcbEvent {
  return {
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
  };
}

function versenden(id: string) {
  return {
    type: "rechnung-versenden" as const,
    data: { rechnungId: id, patientennummer: 1, datum: "2026-09-20" },
  };
}

function maxMitAnschrift(): AbrechnungDcbEvent {
  return {
    type: "patient-aufgenommen",
    data: {
      patientennummer: 1,
      praxiskuerzel: "NHP",
      aufnahmejahr: 2026,
      geburtsdatum: "1980-09-20",
      name: { vorname: "Max", nachname: "Mustermann" },
      anschrift: {
        strasse: "Lindenweg 5",
        postleitzahl: "12345",
        ort: "Musterstadt",
      },
    },
  };
}

function maxAufgenommen(): AbrechnungDcbEvent {
  return {
    type: "patient-aufgenommen",
    data: {
      patientennummer: 1,
      praxiskuerzel: "NHP",
      aufnahmejahr: 2026,
      geburtsdatum: "1980-09-20",
      name: { vorname: "Max", nachname: "Mustermann" },
    },
  };
}
