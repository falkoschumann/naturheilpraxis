// Copyright (c) 2026 Falko Schumann. MIT license.

import { describe, expect, it } from "vitest";

import type { DomainEvent } from "./events.ts";
import {
  initialReadModel,
  patientenErmitteln,
  patientErmitteln,
  projectAll,
} from "./patientenansicht.ts";

describe("Patientenansicht", () => {
  it("sollte die neuesten Patienten zuerst ermitteln", () => {
    const readModel = projectAll(initialReadModel, [
      {
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
      },
      {
        type: "patient-aufgenommen",
        data: {
          patientennummer: 2,
          praxiskuerzel: "NHP",
          aufnahmejahr: 2026,
          geburtsdatum: "1982-03-14",
          name: { vorname: "Erika", nachname: "Mustermann" },
          anschrift: {
            strasse: "Lindenweg 5",
            postleitzahl: "12345",
            ort: "Musterstadt",
          },
          partnerVon: 1,
        },
      },
      {
        type: "patientendaten-geaendert",
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
          kontakt: { mobiltelefon: "0170 1234567" },
        },
      },
    ]);

    const result = patientenErmitteln(readModel, {
      type: "patienten-ermitteln",
      parameters: {},
    });

    expect(result).toEqual([
      {
        patientennummer: 2,
        praxiskuerzel: "NHP",
        aufnahmejahr: 2026,
        geburtsdatum: "1982-03-14",
        vorname: "Erika",
        nachname: "Mustermann",
        strasse: "Lindenweg 5",
        postleitzahl: "12345",
        ort: "Musterstadt",
        partnerVon: 1,
        partnerVonName: "Mustermann, Max (Nr. 1), geboren am 20.09.1980",
      },
      {
        patientennummer: 1,
        praxiskuerzel: "NHP",
        aufnahmejahr: 2026,
        geburtsdatum: "1980-09-20",
        vorname: "Max",
        nachname: "Mustermann",
        strasse: "Lindenweg 5",
        postleitzahl: "12345",
        ort: "Musterstadt",
        mobiltelefon: "0170 1234567",
      },
    ]);
  });

  it("sollte Patienten mit Suchbegriff ermitteln", () => {
    const readModel = projectAll(initialReadModel, [
      aufgenommen(
        1,
        "Max",
        "Mustermann",
        "Lindenweg 5",
        "12345",
        "Musterstadt",
      ),
      aufgenommen(
        2,
        "Erika",
        "Mustermann",
        "Lindenweg 15",
        "12345",
        "Musterstadt",
      ),
      aufgenommen(
        3,
        "Max",
        "Beispiel",
        "Lindenweg 5",
        "54321",
        "Beispielstadt",
      ),
    ]);

    const result = patientenErmitteln(readModel, {
      type: "patienten-ermitteln",
      parameters: { suchbegriff: 'mustermann "LINDENWEG 5"' },
    });

    expect(result).toEqual([
      {
        patientennummer: 1,
        praxiskuerzel: "NHP",
        aufnahmejahr: 2026,
        geburtsdatum: "1980-09-20",
        vorname: "Max",
        nachname: "Mustermann",
        strasse: "Lindenweg 5",
        postleitzahl: "12345",
        ort: "Musterstadt",
      },
    ]);
  });

  it("sollte Patient ermitteln", () => {
    const readModel = projectAll(initialReadModel, [
      {
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
      },
      {
        type: "patient-aufgenommen",
        data: {
          patientennummer: 2,
          praxiskuerzel: "NHP",
          aufnahmejahr: 2026,
          geburtsdatum: "2010-05-01",
          name: { vorname: "Paul", nachname: "Mustermann" },
          anschrift: {
            strasse: "Lindenweg 5",
            postleitzahl: "12345",
            ort: "Musterstadt",
          },
          kindVon: 1,
        },
      },
    ]);

    const result = patientErmitteln(readModel, {
      type: "patient-ermitteln",
      parameters: { patientennummer: 2 },
    });

    expect(result).toEqual({
      patientennummer: 2,
      praxiskuerzel: "NHP",
      aufnahmejahr: 2026,
      geburtsdatum: "2010-05-01",
      name: { vorname: "Paul", nachname: "Mustermann" },
      anschrift: {
        strasse: "Lindenweg 5",
        postleitzahl: "12345",
        ort: "Musterstadt",
      },
      kindVon: 1,
      kindVonName: "Mustermann, Max (Nr. 1), geboren am 20.09.1980",
    });
  });

  it("sollte keinen Patienten ermitteln, wenn die Nummer unbekannt ist", () => {
    const readModel = projectAll(initialReadModel, []);

    const result = patientErmitteln(readModel, {
      type: "patient-ermitteln",
      parameters: { patientennummer: 7 },
    });

    expect(result).toBeUndefined();
  });
});

function aufgenommen(
  patientennummer: number,
  vorname: string,
  nachname: string,
  strasse: string,
  postleitzahl: string,
  ort: string,
): DomainEvent {
  return {
    type: "patient-aufgenommen",
    data: {
      patientennummer,
      praxiskuerzel: "NHP",
      aufnahmejahr: 2026,
      geburtsdatum:
        ["1980-09-20", "1982-03-14", "1975-01-02"][patientennummer - 1] ??
        "1980-01-01",
      name: { vorname, nachname },
      anschrift: { strasse, postleitzahl, ort },
    },
  };
}
