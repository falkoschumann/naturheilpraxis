// Copyright (c) 2026 Falko Schumann. MIT license.

import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";

import type { NaturheilpraxisApi } from "../../../shared/application/naturheilpraxis-api.ts";
import type { Patient } from "../../../shared/domain/entities.ts";
import type { DomainEvent } from "../../../shared/domain/events.ts";
import { FakeNaturheilpraxisApi } from "./fake-naturheilpraxis-api.ts";
import { PatientPage } from "./patient-page.tsx";

describe("Patient", () => {
  it("sollte die Karteikarte des Patienten anzeigen", async () => {
    const api = new FakeNaturheilpraxisApi({ events: [praxisAngelegt(), aufgenommen(max())] });

    zeigePatient(api, 1);

    expect(await screen.findByRole("heading", { level: 1, name: "Max Mustermann" })).toBeDefined();
    expect(screen.getByText(/Nr\. 1 · geb\. 20\.09\.1980/)).toBeDefined();
    expect(screen.getByText(/keine Anschrift/)).toBeDefined();
  });

  it("sollte einen Hinweis zeigen, wenn es den Patienten nicht gibt", async () => {
    const api = new FakeNaturheilpraxisApi();

    zeigePatient(api, 7);

    expect(await screen.findByText(/Einen Patienten mit der Nummer 7 gibt es nicht/)).toBeDefined();
  });

  it("sollte die Stammdaten ändern", async () => {
    const api = new FakeNaturheilpraxisApi({
      events: [praxisAngelegt(), aufgenommen(max()), aufgenommen(erika())],
    });
    zeigePatient(api, 1);
    const stammdaten = await screen.findByRole("form", { name: "Stammdaten" });

    eingeben(stammdaten, "Beruf", "Tischler");
    fireEvent.change(within(stammdaten).getByLabelText("Partner von"), { target: { value: "2" } });
    fireEvent.click(within(stammdaten).getByRole("button", { name: "Speichern" }));

    expect(await screen.findByText("Die Stammdaten wurden gespeichert.")).toBeDefined();
    expect(api.commands).toEqual([
      { type: "patientendaten-aendern", data: { ...max(), beruf: "Tischler", partnerVon: 2 } },
    ]);
  });

  it("sollte Änderungen an den Stammdaten verwerfen", async () => {
    const api = new FakeNaturheilpraxisApi({ events: [praxisAngelegt(), aufgenommen(max())] });
    zeigePatient(api, 1);
    const stammdaten = await screen.findByRole("form", { name: "Stammdaten" });
    eingeben(stammdaten, "Vorname", "Moritz");

    fireEvent.click(within(stammdaten).getByRole("button", { name: "Änderungen verwerfen" }));

    expect(within(stammdaten).getByLabelText("Vorname")).toHaveProperty("value", "Max");
    expect(api.commands).toEqual([]);
  });
});

function zeigePatient(api: NaturheilpraxisApi, patientennummer: number) {
  render(
    <MemoryRouter initialEntries={[`/patienten/${patientennummer}`]}>
      <Routes>
        <Route path="/patienten/:patientennummer" element={<PatientPage api={api} />} />
      </Routes>
    </MemoryRouter>,
  );
}

function eingeben(container: HTMLElement, label: string, value: string) {
  fireEvent.change(within(container).getByLabelText(label), { target: { value } });
}

function praxisAngelegt(): DomainEvent {
  return {
    type: "praxis-angelegt",
    data: {
      praxiskuerzel: "NHP",
      name: "Naturheilpraxis am Markt",
      anschrift: { strasse: "Marktplatz 1", postleitzahl: "12345", ort: "Musterstadt" },
    },
  };
}

function aufgenommen(patient: Patient): DomainEvent {
  return { type: "patient-aufgenommen", data: patient };
}

function max(): Patient {
  return {
    patientennummer: 1,
    praxiskuerzel: "NHP",
    aufnahmejahr: 2026,
    geburtsdatum: "1980-09-20",
    name: { vorname: "Max", nachname: "Mustermann" },
  };
}

function erika(): Patient {
  return {
    patientennummer: 2,
    praxiskuerzel: "NHP",
    aufnahmejahr: 2026,
    geburtsdatum: "1982-03-14",
    name: { vorname: "Erika", nachname: "Mustermann" },
  };
}
