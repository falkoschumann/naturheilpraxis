// Copyright (c) 2026 Falko Schumann. MIT license.

import { describe, expect, it } from "vitest";

import type { RechnungErmittelnQueryResult } from "../../shared/domain/rechnungsansicht.ts";
import {
  rechnungErzeugen,
  rechnungsdaten,
  rechnungsdokument,
  standardvorlage,
} from "./rechnungsvorlage.ts";

describe("Rechnungsvorlage", () => {
  describe("Rechnungsdaten", () => {
    it("sollte Datum und Beträge einer versendeten Rechnung formatieren", () => {
      const daten = rechnungsdaten(versendeteRechnung());

      expect(daten).toEqual({
        rechnungsnummer: "1/261011",
        rechnungsdatum: "11.10.2026",
        entwurf: false,
        status: "versendet",
        praxis: {
          name: "Naturheilpraxis am Markt",
          anschrift: {
            strasse: "Marktplatz 1",
            postleitzahl: "12345",
            ort: "Musterstadt",
          },
          kontakt: { telefon: "0123 456789", fax: "0123 456780" },
        },
        patient: {
          patientennummer: 1,
          anrede: "Herr",
          titel: "Dr.",
          vorname: "Max",
          nachname: "Mustermann",
          name: "Dr. Max Mustermann",
          geburtsdatum: "01.02.1980",
          anschrift: {
            strasse: "Lindenweg 5",
            postleitzahl: "12345",
            ort: "Musterstadt",
          },
        },
        diagnosetext: "Chronische Rückenschmerzen",
        rechnungstext:
          "Bitte überweisen Sie den Betrag innerhalb von 14 Tagen.",
        positionen: [
          {
            datum: "14.09.2026",
            ziffer: "1",
            bezeichnung: "Eingehende Untersuchung",
            anzahl: 1,
            einzelbetrag: "20,50 €",
            betrag: "20,50 €",
          },
          {
            datum: "21.09.2026",
            ziffer: "20.1",
            bezeichnung: "Akupunktur",
            anzahl: 2,
            einzelbetrag: "15,30 €",
            betrag: "30,60 €",
          },
        ],
        gesamtbetrag: "51,10 €",
      });
    });

    it("sollte einen Entwurf ohne Rechnungsnummer und Rechnungsdatum kennzeichnen", () => {
      const daten = rechnungsdaten(entwurf());

      expect(daten.entwurf).toBe(true);
      expect(daten).not.toHaveProperty("rechnungsnummer");
      expect(daten).not.toHaveProperty("rechnungsdatum");
    });
  });

  describe("Rechnung erzeugen", () => {
    it("sollte die Platzhalter mit den Daten der Rechnung füllen", () => {
      const html = rechnungErzeugen(
        "<h1>Rechnung {{rechnungsnummer}}</h1>{{#positionen}}<p>{{bezeichnung}}: {{betrag}}</p>{{/positionen}}",
        versendeteRechnung(),
      );

      expect(html).toBe(
        "<h1>Rechnung 1&#x2F;261011</h1><p>Eingehende Untersuchung: 20,50 €</p><p>Akupunktur: 30,60 €</p>",
      );
    });

    it("sollte die Daten für HTML maskieren", () => {
      const html = rechnungErzeugen("<p>{{diagnosetext}}</p>", {
        ...versendeteRechnung(),
        diagnosetext: "<script>alert(1)</script>",
      });

      expect(html).toBe("<p>&lt;script&gt;alert(1)&lt;&#x2F;script&gt;</p>");
    });

    it("sollte eine fehlerhafte Vorlage ablehnen", () => {
      expect(() =>
        rechnungErzeugen("{{#positionen}}", versendeteRechnung()),
      ).toThrow();
    });

    it("sollte mit der Standardvorlage eine versendete Rechnung erzeugen", () => {
      const html = ohneLeerraum(
        rechnungErzeugen(standardvorlage, versendeteRechnung()),
      );

      expect(html).toContain("<title>Rechnung 1&#x2F;261011</title>");
      expect(html).toContain("<dd>11.10.2026</dd>");
      expect(html).toContain("<div>Herr</div>");
      expect(html).toContain("<div>Dr. Max Mustermann</div>");
      expect(html).toContain("<div>Lindenweg 5</div>");
      expect(html).toContain("<div>Tel. 0123 456789</div>");
      expect(html).toContain("<div>Fax 0123 456780</div>");
      expect(html).toContain("<td>Akupunktur</td>");
      expect(html).toContain('<th class="zahl">51,10 €</th>');
      expect(html).not.toContain("Anschrift fehlt");
      expect(html).not.toContain("beim Versand");
    });

    it("sollte mit der Standardvorlage einen Entwurf ohne Anschrift erzeugen", () => {
      const { patientennummer, name, geburtsdatum } = entwurf().patient;

      const html = ohneLeerraum(
        rechnungErzeugen(standardvorlage, {
          ...entwurf(),
          patient: { patientennummer, name, geburtsdatum },
        }),
      );

      expect(html).toContain("<title>Rechnungsentwurf</title>");
      expect(html).toContain("<em>beim Versand</em>");
      expect(html).toContain("Anschrift fehlt");
    });
  });
});

describe("Rechnungsdokument", () => {
  it("sollte die Rechnung mit der gesicherten Vorlage erzeugen", () => {
    const dokument = rechnungsdokument({
      rechnung: versendeteRechnung(),
      vorlage: "<p>{{patient.name}}: {{gesamtbetrag}}</p>",
    });

    expect(dokument).toEqual({
      status: 200,
      html: "<p>Dr. Max Mustermann: 51,10\u00a0€</p>",
    });
  });

  it("sollte die Rechnung mit der Standardvorlage erzeugen, solange keine Vorlage gesichert ist", () => {
    const dokument = rechnungsdokument({ rechnung: versendeteRechnung() });

    expect(dokument).toEqual({
      status: 200,
      html: rechnungErzeugen(standardvorlage, versendeteRechnung()),
    });
  });

  it("sollte erklären, dass es die Rechnung nicht gibt", () => {
    const dokument = rechnungsdokument(undefined);

    expect(dokument.status).toBe(404);
    expect(dokument.html).toContain("Diese Rechnung gibt es nicht (mehr).");
  });

  it("sollte erklären, dass die Vorlage fehlerhaft ist", () => {
    const dokument = rechnungsdokument({
      rechnung: versendeteRechnung(),
      vorlage: "{{#positionen}}",
    });

    expect(dokument.status).toBe(500);
    expect(dokument.html).toContain(
      "Bitte prüfen Sie die Platzhalter der Rechnungsvorlage.",
    );
  });
});

type Rechnung = NonNullable<RechnungErmittelnQueryResult>;

// The whitespace around the tags of the formatted Standardvorlage is not
// rendered.
function ohneLeerraum(html: string): string {
  return html.replace(/\s*(<[^>]+>)\s*/g, "$1");
}

function entwurf(): Rechnung {
  return {
    rechnungId: "33333333-3333-4333-8333-333333333333",
    status: "entwurf",
    praxis: {
      praxiskuerzel: "NHP",
      name: "Naturheilpraxis am Markt",
      anschrift: {
        strasse: "Marktplatz 1",
        postleitzahl: "12345",
        ort: "Musterstadt",
      },
      kontakt: { telefon: "0123 456789", fax: "0123 456780" },
    },
    patient: {
      patientennummer: 1,
      name: {
        anrede: "Herr",
        titel: "Dr.",
        vorname: "Max",
        nachname: "Mustermann",
      },
      geburtsdatum: "1980-02-01",
      anschrift: {
        strasse: "Lindenweg 5",
        postleitzahl: "12345",
        ort: "Musterstadt",
      },
    },
    diagnosetext: "Chronische Rückenschmerzen",
    rechnungstext: "Bitte überweisen Sie den Betrag innerhalb von 14 Tagen.",
    positionen: [
      {
        leistungId: "22222222-2222-4222-8222-222222222222",
        datum: "2026-09-14",
        ziffer: "1",
        bezeichnung: "Eingehende Untersuchung",
        anzahl: 1,
        einzelbetrag: { cents: 2050 },
        betrag: { cents: 2050 },
      },
      {
        leistungId: "23232323-2323-4323-8323-232323232323",
        datum: "2026-09-21",
        ziffer: "20.1",
        bezeichnung: "Akupunktur",
        anzahl: 2,
        einzelbetrag: { cents: 1530 },
        betrag: { cents: 3060 },
      },
    ],
    gesamtbetrag: { cents: 5110 },
  };
}

function versendeteRechnung(): Rechnung {
  return {
    ...entwurf(),
    rechnungsnummer: "1/261011",
    datum: "2026-10-11",
    status: "versendet",
  };
}
