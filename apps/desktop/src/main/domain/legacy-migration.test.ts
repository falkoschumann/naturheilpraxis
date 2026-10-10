// Copyright (c) 2026 Falko Schumann. MIT license.

import { describe, expect, it } from "vitest";

import type { DomainEvent } from "../../shared/domain/events.ts";
import {
  migrateLegacyData,
  migrationTags,
  type LegacyActivity,
  type LegacyData,
  type LegacyFee,
  type LegacyInvoice,
  type LegacyPatient,
  type LegacyPraxis,
} from "./legacy-migration.ts";

describe("Legacy Migration", () => {
  describe("Praxen", () => {
    it("sollte die Praxen mit dem Rechnungstext ihrer letzten Rechnung anlegen", () => {
      const data = legacyData({
        patients: [patient({ id: 1 })],
        activities: [
          activity({ id: 1, invoiceId: 1 }),
          activity({ id: 2, invoiceId: 2 }),
        ],
        invoices: [
          invoice({
            id: 1,
            date: "2022-01-10",
            invoiceNote: "Alter&#160;Text",
          }),
          invoice({
            id: 2,
            date: "2022-02-10",
            invoiceNote: "Neuer&#160;Text",
          }),
        ],
      });

      const { events } = migrate(data);

      expect(ofType(events, "praxis-angelegt")).toEqual([
        {
          type: "praxis-angelegt",
          data: { ...praxen[0]?.praxis, rechnungstext: "Neuer Text" },
        },
        { type: "praxis-angelegt", data: praxen[1]?.praxis },
        { type: "praxis-angelegt", data: praxen[2]?.praxis },
      ]);
    });
  });

  it("sollte ohne Praxis nicht migrieren", () => {
    const data = legacyData({});

    expect(() => migrateLegacyData(data, [], () => "id")).toThrow(
      "Es ist keine Praxis angegeben.",
    );
  });

  describe("Gebühren", () => {
    it("sollte Gebühren mit Betrag in Cent anlegen", () => {
      const data = legacyData({
        fees: [
          fee({
            id: 1,
            shortNote: "1",
            description: "Untersuchung",
            amount: "20,50",
          }),
          fee({
            id: 2,
            shortNote: "3",
            description: "Kurze Info.",
            amount: 4.5,
          }),
          fee({
            id: 3,
            shortNote: "Sonder 13",
            description: "Vitamin B Infusion",
            amount: null,
          }),
        ],
      });

      const { events } = migrate(data);

      expect(ofType(events, "gebuehr-angelegt")).toEqual([
        {
          type: "gebuehr-angelegt",
          data: {
            ziffer: "1",
            bezeichnung: "Untersuchung",
            betrag: { cents: 2050 },
          },
        },
        {
          type: "gebuehr-angelegt",
          data: {
            ziffer: "3",
            bezeichnung: "Kurze Info.",
            betrag: { cents: 450 },
          },
        },
        {
          type: "gebuehr-angelegt",
          data: {
            ziffer: "Sonder 13",
            bezeichnung: "Vitamin B Infusion",
            betrag: { cents: 0 },
          },
        },
      ]);
    });

    it("sollte doppelte Ziffern durch einen Suffix eindeutig machen", () => {
      const data = legacyData({
        fees: [
          fee({ id: 7, shortNote: "Sonder 01", description: "Mineralstoffe" }),
          fee({
            id: 3,
            shortNote: "Sonder 01 ",
            description: "Vitamin C Infusion",
          }),
        ],
      });

      const { events } = migrate(data);

      expect(
        ofType(events, "gebuehr-angelegt").map((event) => [
          event.data.ziffer,
          event.data.bezeichnung,
        ]),
      ).toEqual([
        ["Sonder 01", "Vitamin C Infusion"],
        ["Sonder 01-2", "Mineralstoffe"],
      ]);
    });
  });

  describe("Patienten", () => {
    it("sollte einen Patienten mit Stammdaten aufnehmen", () => {
      const data = legacyData({
        patients: [
          patient({
            id: 42,
            agencyId: 20,
            acceptance: 2002,
            dayOfBirth: "1973-05-27",
            title: "Frau",
            academicTitle: "Dr. ",
            forename: "Erika ",
            surname: "Mustermann",
            street: "Hauptstraße",
            streetNumber: "5a",
            postalCode: "12345",
            city: "Musterstadt",
            country: "Deutschland",
            callNumber: "0123 456789",
            mobilePhone: "",
            email: "erika@example.com",
            occupation: "Lehrerin",
            familyStatus: "verheiratet",
            citizenship: "deutsch",
            memorandum: "Allergie gegen Pollen",
            handlings: ["Aktiv", "Weihnachtskarte"],
          }),
        ],
      });

      const { events } = migrate(data);

      expect(ofType(events, "patient-aufgenommen")).toEqual([
        {
          type: "patient-aufgenommen",
          data: {
            patientennummer: 42,
            praxiskuerzel: "ABC",
            aufnahmejahr: 2002,
            geburtsdatum: "1973-05-27",
            name: {
              anrede: "Frau",
              titel: "Dr.",
              vorname: "Erika",
              nachname: "Mustermann",
            },
            anschrift: {
              strasse: "Hauptstraße 5a",
              postleitzahl: "12345",
              ort: "Musterstadt",
            },
            kontakt: { telefon: "0123 456789", email: "erika@example.com" },
            beruf: "Lehrerin",
            familienstand: "verheiratet",
            staatsangehoerigkeit: "deutsch",
            notizen: "Allergie gegen Pollen",
            schluesselworte: ["Aktiv", "Weihnachtskarte"],
          },
        },
      ]);
    });

    it("sollte nur die nötigen Angaben übernehmen, wenn die übrigen fehlen", () => {
      const data = legacyData({
        patients: [patient({ id: 1, forename: "Max", surname: "Mustermann" })],
      });

      const { events } = migrate(data);

      expect(ofType(events, "patient-aufgenommen")).toEqual([
        {
          type: "patient-aufgenommen",
          data: {
            patientennummer: 1,
            praxiskuerzel: "NHP",
            aufnahmejahr: 2000,
            geburtsdatum: "1980-01-01",
            name: { vorname: "Max", nachname: "Mustermann" },
          },
        },
      ]);
    });

    it("sollte einen ausländischen Staat in die Anschrift übernehmen", () => {
      const data = legacyData({
        patients: [
          patient({
            id: 1,
            street: "Hauptgasse 1",
            postalCode: "3000",
            city: "Bern",
            country: "Schweiz",
          }),
          patient({
            id: 2,
            street: "Marktplatz 1",
            postalCode: "12345",
            city: "Musterstadt",
            country: "D",
          }),
        ],
      });

      const { events } = migrate(data);

      expect(
        ofType(events, "patient-aufgenommen").map(
          (event) => event.data.anschrift,
        ),
      ).toEqual([
        {
          strasse: "Hauptgasse 1",
          postleitzahl: "3000",
          ort: "Bern",
          staat: "Schweiz",
        },
        { strasse: "Marktplatz 1", postleitzahl: "12345", ort: "Musterstadt" },
      ]);
    });

    it("sollte Tippfehler in Anrede und Familienstand vereinheitlichen", () => {
      const data = legacyData({
        patients: [
          patient({ id: 1, title: "Frua", familyStatus: "verwit." }),
          patient({ id: 2, title: "Herrn", familyStatus: "geschied." }),
          patient({ id: 3, title: "herr", familyStatus: "verheiraet" }),
          patient({ id: 4, title: "Fräulein", familyStatus: "getr. lebend" }),
          patient({ id: 5, title: "Mrs.", familyStatus: "ledig" }),
        ],
      });

      const { events } = migrate(data);

      expect(
        ofType(events, "patient-aufgenommen").map((event) => [
          event.data.name.anrede,
          event.data.familienstand,
        ]),
      ).toEqual([
        ["Frau", "verwitwet"],
        ["Herr", "geschieden"],
        ["Herr", "verheiratet"],
        ["Fräulein", "getrennt lebend"],
        ["Mrs.", "ledig"],
      ]);
    });

    it("sollte offensichtliche Fehler im Geburtsdatum korrigieren", () => {
      const data = legacyData({
        patients: [
          patient({ id: 1, dayOfBirth: "1937-19-01" }),
          patient({ id: 2, dayOfBirth: "1936-111-13" }),
          patient({ id: 3, dayOfBirth: "63-10-27" }),
          patient({ id: 4, dayOfBirth: "977-03-01" }),
        ],
      });

      const { events } = migrate(data);

      expect(
        ofType(events, "patient-aufgenommen").map(
          (event) => event.data.geburtsdatum,
        ),
      ).toEqual(["1937-01-19", "1936-11-13", "1963-10-27", "1977-03-01"]);
    });

    it("sollte ein unklares oder fehlendes Geburtsdatum durch einen Platzhalter ersetzen und notieren", () => {
      const data = legacyData({
        patients: [
          patient({ id: 1, dayOfBirth: "1941-20-25", memorandum: "Notiz" }),
          patient({ id: 2, dayOfBirth: "1852-09-06", acceptance: 1993 }),
          patient({ id: 3, dayOfBirth: "7199-01-30", acceptance: 2022 }),
          patient({
            id: 4,
            dayOfBirth: "",
            geburtstag: "25",
            geburtsmonat: "1",
            geburtsjahr: "19*2",
          }),
          patient({ id: 5, dayOfBirth: "" }),
        ],
      });

      const { events } = migrate(data);

      expect(
        ofType(events, "patient-aufgenommen").map((event) => [
          event.data.geburtsdatum,
          event.data.notizen,
        ]),
      ).toEqual([
        ["1800-01-01", "Notiz\nGeburtsdatum alt: 1941-20-25"],
        ["1800-01-01", "Geburtsdatum alt: 1852-09-06"],
        ["1800-01-01", "Geburtsdatum alt: 7199-01-30"],
        ["1800-01-01", "Geburtsdatum alt: 25.1.19*2"],
        ["1800-01-01", undefined],
      ]);
    });

    it("sollte ein fehlendes Aufnahmejahr aus der ersten Leistung ableiten", () => {
      const data = legacyData({
        patients: [
          patient({ id: 1, acceptance: null }),
          patient({ id: 2, acceptance: null }),
        ],
        activities: [activity({ id: 1, customerId: 1, date: "2004-05-06" })],
      });

      const { events } = migrate(data);

      expect(
        ofType(events, "patient-aufgenommen").map((event) => [
          event.data.aufnahmejahr,
          event.data.geburtsdatum,
        ]),
      ).toEqual([
        [2004, "1980-01-01"],
        [1800, "1980-01-01"],
      ]);
    });

    it("sollte Partner als Patientennummer und Angehörige im Freitext als Notiz übernehmen", () => {
      const data = legacyData({
        patients: [
          patient({ id: 1, partnerFrom: 2 }),
          patient({ id: 2, partnerFrom: 1 }),
          patient({
            id: 3,
            partnerFrom: "Paul Beispiel",
            childFrom: "Anna Beispiel\u0008",
          }),
        ],
      });

      const { events } = migrate(data);

      expect(
        ofType(events, "patient-aufgenommen").map((event) => [
          event.data.partnerVon,
          event.data.notizen,
        ]),
      ).toEqual([
        [2, undefined],
        [1, undefined],
        [undefined, "Partner: Paul Beispiel\nKind von: Anna Beispiel"],
      ]);
    });

    it("sollte leere Karteikarten ohne Namen und Leistungen weglassen", () => {
      const data = legacyData({
        patients: [
          patient({ id: 1, forename: "", surname: "" }),
          patient({ id: 2, forename: "", surname: "Beispiel" }),
          patient({ id: 3, forename: "", surname: "" }),
        ],
        activities: [activity({ id: 1, customerId: 3 })],
      });

      const { events, notes } = migrate(data);

      expect(
        ofType(events, "patient-aufgenommen").map(
          (event) => event.data.patientennummer,
        ),
      ).toEqual([2, 3]);
      expect(notes).toContain(
        "Patient 1 ohne Namen und Leistungen wird nicht übernommen.",
      );
    });

    it("sollte Patienten ohne Praxis der Praxis ihrer ersten Rechnung zuordnen", () => {
      const data = legacyData({
        patients: [
          patient({ id: 1, agencyId: null }),
          patient({ id: 2, agencyId: 1 }),
        ],
        activities: [
          activity({ id: 1, customerId: 1, invoiceId: 1 }),
          activity({ id: 2, customerId: 1, invoiceId: 2 }),
          activity({ id: 3, customerId: 2, agencyId: 30, invoiceId: 0 }),
        ],
        invoices: [
          invoice({ id: 1, customerId: 1, agencyId: 10, date: "2020-02-01" }),
          invoice({ id: 2, customerId: 1, agencyId: 20, date: "2020-01-01" }),
        ],
      });

      const { events } = migrate(data);

      expect(
        ofType(events, "patient-aufgenommen").map(
          (event) => event.data.praxiskuerzel,
        ),
      ).toEqual(["ABC", "XYZ"]);
    });

    it("sollte Patienten ohne Praxis, Rechnungen und Leistungen der Hauptpraxis zuordnen", () => {
      const data = legacyData({
        patients: [patient({ id: 1, agencyId: null })],
      });

      const { events } = migrate(data);

      expect(
        ofType(events, "patient-aufgenommen").map(
          (event) => event.data.praxiskuerzel,
        ),
      ).toEqual(["NHP"]);
    });
  });

  describe("Leistungen", () => {
    it("sollte eine Leistung mit Einzelbetrag in Cent erbringen", () => {
      const data = legacyData({
        patients: [patient({ id: 1 })],
        activities: [
          activity({
            id: 1,
            agencyId: 20,
            date: "2022-11-24",
            shortNote: "20.4 ",
            description: "Teilmass.",
            quantity: 2,
            amount: "10,50",
          }),
        ],
      });

      const { events } = migrate(data);

      expect(ofType(events, "leistung-erbracht")).toEqual([
        {
          type: "leistung-erbracht",
          data: {
            leistungId: "id-1",
            praxiskuerzel: "ABC",
            patientennummer: 1,
            datum: "2022-11-24",
            ziffer: "20.4",
            bezeichnung: "Teilmass.",
            anzahl: 2,
            einzelbetrag: { cents: 1050 },
          },
        },
      ]);
    });

    it("sollte einen unlesbaren Betrag als 0 € übernehmen", () => {
      const data = legacyData({
        patients: [patient({ id: 1 })],
        activities: [
          activity({ id: 1, amount: "selbst" }),
          activity({ id: 2, amount: null }),
        ],
      });

      const { events } = migrate(data);

      expect(
        ofType(events, "leistung-erbracht").map(
          (event) => event.data.einzelbetrag,
        ),
      ).toEqual([{ cents: 0 }, { cents: 0 }]);
    });

    it("sollte die Praxis einer Leistung ohne gültige Praxis aus Rechnung oder Patient ableiten", () => {
      const data = legacyData({
        patients: [patient({ id: 1, agencyId: 30 })],
        activities: [
          activity({ id: 1, agencyId: 1, invoiceId: 1, date: "2020-01-01" }),
          activity({ id: 2, agencyId: 1, invoiceId: 0, date: "2020-01-02" }),
          activity({ id: 3, agencyId: 20, invoiceId: 0, date: "2020-01-03" }),
        ],
        invoices: [invoice({ id: 1, agencyId: 10 })],
      });

      const { events } = migrate(data);

      expect(
        ofType(events, "leistung-erbracht").map(
          (event) => event.data.praxiskuerzel,
        ),
      ).toEqual(["NHP", "XYZ", "ABC"]);
    });

    it("sollte einer Leistung ohne Datum das Datum ihrer Rechnung geben", () => {
      const data = legacyData({
        patients: [patient({ id: 1 })],
        activities: [activity({ id: 1, date: "", invoiceId: 1 })],
        invoices: [invoice({ id: 1, date: "2005-03-04" })],
      });

      const { events } = migrate(data);

      expect(
        ofType(events, "leistung-erbracht").map((event) => event.data.datum),
      ).toEqual(["2005-03-04"]);
    });
  });

  describe("Diagnosen", () => {
    it("sollte eine Diagnose je Patient und Text zum frühesten Rechnungsdatum stellen", () => {
      const data = legacyData({
        patients: [patient({ id: 1 })],
        activities: [
          activity({ id: 1, invoiceId: 1 }),
          activity({ id: 2, invoiceId: 2 }),
          activity({ id: 3, invoiceId: 3 }),
        ],
        invoices: [
          invoice({ id: 1, date: "2020-03-01", comment: " Lumbago" }),
          invoice({
            id: 2,
            date: "2020-01-01",
            comment: "Lumbago",
            agencyId: 20,
          }),
          invoice({ id: 3, date: "2020-02-01", comment: "" }),
        ],
      });

      const { events } = migrate(data);

      expect(ofType(events, "diagnose-gestellt")).toEqual([
        {
          type: "diagnose-gestellt",
          data: {
            diagnoseId: expect.any(String),
            praxiskuerzel: "ABC",
            patientennummer: 1,
            datum: "2020-01-01",
            text: "Lumbago",
          },
        },
      ]);
    });

    it("sollte die Diagnose einer Rechnung ohne Leistungen übernehmen", () => {
      const data = legacyData({
        patients: [patient({ id: 1 })],
        invoices: [invoice({ id: 1, date: "2019-11-07", comment: "Migräne" })],
      });

      const { events } = migrate(data);

      expect(
        ofType(events, "diagnose-gestellt").map((event) => [
          event.data.datum,
          event.data.text,
        ]),
      ).toEqual([["2019-11-07", "Migräne"]]);
    });

    it("sollte das Datum der frühesten Leistung nehmen, wenn die Rechnung kein Datum hat", () => {
      const data = legacyData({
        patients: [patient({ id: 1 })],
        activities: [
          activity({ id: 1, invoiceId: 1, date: "2006-03-02" }),
          activity({ id: 2, invoiceId: 1, date: "2006-03-01" }),
        ],
        invoices: [
          invoice({
            id: 1,
            date: "",
            creditNote: null,
            cleared: 0,
            comment: "Gastritis",
          }),
        ],
      });

      const { events } = migrate(data);

      expect(
        ofType(events, "diagnose-gestellt").map((event) => event.data.datum),
      ).toEqual(["2006-03-01"]);
    });
  });

  describe("Rechnungen", () => {
    it("sollte eine versendete Rechnung erstellen und versenden", () => {
      const data = legacyData({
        patients: [patient({ id: 1234 })],
        activities: [
          activity({
            id: 2,
            customerId: 1234,
            invoiceId: 7,
            date: "2022-11-24",
          }),
          activity({
            id: 1,
            customerId: 1234,
            invoiceId: 7,
            date: "2022-11-24",
          }),
        ],
        invoices: [
          invoice({
            id: 7,
            customerId: 1234,
            agencyId: 20,
            date: "2022-11-25",
            invoiceNumber: "1234/221125",
            comment: " Chronische Rückenschmerzen",
            invoiceNote: "Bitte&#160;überweisen",
          }),
        ],
      });

      const { events } = migrate(data);

      const [ersteLeistung, zweiteLeistung] = ofType(
        events,
        "leistung-erbracht",
      ).map((event) => event.data.leistungId);
      const [rechnungErstellt] = ofType(events, "rechnung-erstellt");
      expect(rechnungErstellt).toEqual({
        type: "rechnung-erstellt",
        data: {
          rechnungId: expect.any(String),
          praxiskuerzel: "ABC",
          patientennummer: 1234,
          diagnosetext: "Chronische Rückenschmerzen",
          rechnungstext: "Bitte überweisen",
          leistungen: [ersteLeistung, zweiteLeistung],
        },
      });
      expect(ofType(events, "rechnung-versendet")).toEqual([
        {
          type: "rechnung-versendet",
          data: {
            rechnungId: rechnungErstellt?.data.rechnungId,
            patientennummer: 1234,
            rechnungsnummer: "1234/221125",
            datum: "2022-11-25",
          },
        },
      ]);
      expect(ofType(events, "rechnung-bezahlt")).toEqual([]);
    });

    it("sollte versendete Rechnungen ab einem Jahr vor der neuesten Rechnung als bezahlt übernehmen", () => {
      const data = legacyData({
        patients: [patient({ id: 1 })],
        activities: [
          activity({ id: 1, invoiceId: 1 }),
          activity({ id: 2, invoiceId: 2 }),
          activity({ id: 3, invoiceId: 3 }),
          activity({ id: 4, invoiceId: 4 }),
        ],
        invoices: [
          invoice({ id: 1, date: "2022-12-29" }),
          invoice({ id: 2, date: "2021-12-30" }),
          invoice({ id: 3, date: "2021-12-29" }),
          invoice({ id: 4, date: "2005-01-01", creditNote: null, cleared: 0 }),
        ],
      });

      const { events } = migrate(data);

      const rechnungIdOf = new Map(
        ofType(events, "rechnung-versendet").map((event) => [
          event.data.datum,
          event.data.rechnungId,
        ]),
      );
      expect(ofType(events, "rechnung-bezahlt")).toEqual([
        {
          type: "rechnung-bezahlt",
          data: { rechnungId: rechnungIdOf.get("2021-12-29") },
        },
      ]);
      expect(ofType(events, "rechnung-versendet")).toHaveLength(3);
    });

    it("sollte als bezahlt markierte oder bar bezahlte Rechnungen als bezahlt übernehmen", () => {
      const data = legacyData({
        patients: [patient({ id: 1 })],
        activities: [
          activity({ id: 1, invoiceId: 1 }),
          activity({ id: 2, invoiceId: 2 }),
        ],
        invoices: [
          invoice({ id: 1, date: "2004-01-01", cleared: 1, creditNote: null }),
          invoice({
            id: 2,
            date: "2010-01-01",
            invoiceNote: "Betrag dankend erhalten.",
          }),
        ],
      });

      const { events } = migrate(data);

      expect(ofType(events, "rechnung-versendet")).toHaveLength(2);
      expect(ofType(events, "rechnung-bezahlt")).toHaveLength(2);
    });

    it("sollte alte unvollendete Rechnungen als Entwurf übernehmen", () => {
      const data = legacyData({
        patients: [patient({ id: 1 })],
        activities: [activity({ id: 1, invoiceId: 1 })],
        invoices: [
          invoice({
            id: 1,
            date: "",
            invoiceNumber: "1/",
            creditNote: null,
            cleared: 0,
            agencyId: 0,
          }),
        ],
      });

      const { events } = migrate(data);

      expect(
        ofType(events, "rechnung-erstellt").map(
          (event) => event.data.praxiskuerzel,
        ),
      ).toEqual(["NHP"]);
      expect(ofType(events, "rechnung-versendet")).toEqual([]);
    });

    it("sollte die Praxis einer Rechnung ohne Praxis aus ihren Leistungen ableiten", () => {
      const data = legacyData({
        patients: [patient({ id: 1, agencyId: 20 })],
        activities: [activity({ id: 1, invoiceId: 1, agencyId: 10 })],
        invoices: [invoice({ id: 1, agencyId: 0 })],
      });

      const { events } = migrate(data);

      expect(
        ofType(events, "rechnung-erstellt").map(
          (event) => event.data.praxiskuerzel,
        ),
      ).toEqual(["NHP"]);
    });

    it("sollte Rechnungen ohne Leistungen weglassen", () => {
      const data = legacyData({
        patients: [patient({ id: 1 })],
        invoices: [invoice({ id: 99, comment: "" })],
      });

      const { events, notes } = migrate(data);

      expect(ofType(events, "rechnung-erstellt")).toEqual([]);
      expect(notes).toContain(
        "Rechnung 99 ohne Leistungen wird nicht übernommen.",
      );
    });
  });

  describe("Reihenfolge und Tags", () => {
    it("sollte Stammdaten vor Bewegungsdaten und jede Rechnung vor ihrem Versand liefern", () => {
      const data = legacyData({
        fees: [fee({ id: 1 })],
        patients: [patient({ id: 1 })],
        activities: [activity({ id: 1, invoiceId: 1 })],
        invoices: [invoice({ id: 1, comment: "Lumbago", cleared: 1 })],
      });

      const { events } = migrate(data);

      expect(events.map((event) => event.type)).toEqual([
        "praxis-angelegt",
        "praxis-angelegt",
        "praxis-angelegt",
        "gebuehr-angelegt",
        "patient-aufgenommen",
        "diagnose-gestellt",
        "leistung-erbracht",
        "rechnung-erstellt",
        "rechnung-versendet",
        "rechnung-bezahlt",
      ]);
    });

    it("sollte Versand und Zahlung zusätzlich mit den Leistungen der Rechnung taggen", () => {
      const data = legacyData({
        patients: [patient({ id: 1 })],
        activities: [activity({ id: 1, invoiceId: 1 })],
        invoices: [invoice({ id: 1, cleared: 1 })],
      });
      const { events } = migrate(data);
      const leistungId = ofType(events, "leistung-erbracht")[0]?.data
        .leistungId;

      const tags = migrationTags(events);

      const tagsOfType = (type: DomainEvent["type"]) =>
        events.filter((event) => event.type === type).map(tags);
      expect(tagsOfType("rechnung-versendet")).toEqual([
        [`leistung:${leistungId}`],
      ]);
      expect(tagsOfType("rechnung-bezahlt")).toEqual([
        [`leistung:${leistungId}`],
      ]);
      expect(tagsOfType("rechnung-erstellt")).toEqual([[]]);
    });
  });
});

// The first Praxis is the main Praxis. Agency 1 is no Praxis.
const praxen: readonly LegacyPraxis[] = [
  {
    agencyId: 10,
    praxis: {
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
    agencyId: 20,
    praxis: {
      praxiskuerzel: "ABC",
      name: "Heilpraxis am Bahnhof",
      anschrift: {
        strasse: "Bahnhofstraße 7",
        postleitzahl: "54321",
        ort: "Beispielstadt",
      },
    },
  },
  {
    agencyId: 30,
    praxis: {
      praxiskuerzel: "XYZ",
      name: "Heilpraxis am Park",
      anschrift: {
        strasse: "Parkweg 3",
        postleitzahl: "67890",
        ort: "Beispieldorf",
      },
    },
  },
];

function migrate(data: LegacyData) {
  let id = 0;
  return migrateLegacyData(data, praxen, () => `id-${++id}`);
}

function ofType<T extends DomainEvent["type"]>(
  events: readonly DomainEvent[],
  type: T,
): Extract<DomainEvent, { type: T }>[] {
  return events.filter(
    (event): event is Extract<DomainEvent, { type: T }> => event.type === type,
  );
}

function legacyData(data: Partial<LegacyData>): LegacyData {
  return { fees: [], patients: [], activities: [], invoices: [], ...data };
}

function fee(data: Partial<LegacyFee>): LegacyFee {
  return {
    id: 1,
    shortNote: "1",
    description: "Untersuchung",
    amount: 20,
    ...data,
  };
}

function patient(data: Partial<LegacyPatient>): LegacyPatient {
  return {
    id: 1,
    agencyId: 10,
    acceptance: 2000,
    dayOfBirth: "1980-01-01",
    geburtstag: "",
    geburtsmonat: "",
    geburtsjahr: "",
    title: "",
    academicTitle: "",
    forename: "Max",
    surname: "Mustermann",
    street: "",
    streetNumber: "",
    postalCode: "",
    city: "",
    country: "",
    callNumber: "",
    mobilePhone: "",
    email: "",
    occupation: "",
    familyStatus: "",
    citizenship: "",
    memorandum: "",
    partnerFrom: "",
    childFrom: "",
    handlings: [],
    ...data,
  };
}

function activity(data: Partial<LegacyActivity>): LegacyActivity {
  return {
    id: 1,
    agencyId: 10,
    customerId: 1,
    invoiceId: 0,
    date: "2020-01-01",
    shortNote: "1",
    description: "Untersuchung",
    quantity: 1,
    amount: 20,
    ...data,
  };
}

function invoice(data: Partial<LegacyInvoice>): LegacyInvoice {
  return {
    id: 1,
    agencyId: 10,
    customerId: 1,
    date: "2020-01-01",
    invoiceNumber: "1/200101",
    cleared: 0,
    creditNote: 0,
    comment: "",
    invoiceNote: "",
    ...data,
  };
}
