// Copyright (c) 2026 Falko Schumann. MIT license.

import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";

import type { NaturheilpraxisApi } from "../../../shared/application/naturheilpraxis-api.ts";
import type { Diagnose, Patient } from "../../../shared/domain/entities.ts";
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
    zeigePatient(api, 1, "/stammdaten");
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
    zeigePatient(api, 1, "/stammdaten");
    const stammdaten = await screen.findByRole("form", { name: "Stammdaten" });
    eingeben(stammdaten, "Vorname", "Moritz");

    fireEvent.click(within(stammdaten).getByRole("button", { name: "Änderungen verwerfen" }));

    expect(within(stammdaten).getByLabelText("Vorname")).toHaveProperty("value", "Max");
    expect(api.commands).toEqual([]);
  });

  it("sollte über die Reiter zu den Stammdaten wechseln", async () => {
    const api = new FakeNaturheilpraxisApi({ events: [praxisAngelegt(), aufgenommen(max())] });
    zeigePatient(api, 1);

    fireEvent.click(await screen.findByRole("link", { name: "Stammdaten" }));

    expect(await screen.findByRole("form", { name: "Stammdaten" })).toBeDefined();
  });

  describe("Behandlung", () => {
    it("sollte die Diagnosen nach Tagen gruppiert anzeigen", async () => {
      const api = new FakeNaturheilpraxisApi({
        events: [praxisAngelegt(), aufgenommen(max()), { type: "diagnose-gestellt", data: rueckenschmerzen() }],
      });

      zeigePatient(api, 1);

      const tag = await screen.findByRole("region", { name: "Montag, 14. September 2026" });
      expect(within(tag).getByText("Chronische Rückenschmerzen")).toBeDefined();
    });

    it("sollte einen Hinweis zeigen, wenn noch nichts erfasst ist", async () => {
      const api = new FakeNaturheilpraxisApi({ events: [praxisAngelegt(), aufgenommen(max())] });

      zeigePatient(api, 1);

      expect(await screen.findByText(/Für diesen Patienten wurde noch nichts erfasst/)).toBeDefined();
    });

    it("sollte eine Diagnose stellen", async () => {
      const api = new FakeNaturheilpraxisApi({ events: [praxisAngelegt(), aufgenommen(max())] });
      zeigePatient(api, 1);
      fireEvent.click(await screen.findByRole("button", { name: "Diagnose stellen" }));
      const dialog = screen.getByRole("dialog", { name: "Diagnose stellen für Max Mustermann" });
      await within(dialog).findByRole("option", { name: "Naturheilpraxis am Markt (NHP)" });
      expect(document.activeElement).toBe(within(dialog).getByLabelText("Diagnose"));

      eingeben(dialog, "Datum", "2026-09-14");
      eingeben(dialog, "Diagnose", "Chronische Rückenschmerzen");
      fireEvent.click(within(dialog).getByRole("button", { name: "Diagnose stellen" }));

      expect(await screen.findByText("Die Diagnose wurde gestellt.")).toBeDefined();
      expect(api.commands).toEqual([
        { type: "diagnose-stellen", data: { ...rueckenschmerzen(), diagnoseId: expect.any(String) } },
      ]);
      expect(await screen.findByText("Chronische Rückenschmerzen")).toBeDefined();
    });

    it("sollte eine Diagnose ohne Text nicht stellen", async () => {
      const api = new FakeNaturheilpraxisApi({ events: [praxisAngelegt(), aufgenommen(max())] });
      zeigePatient(api, 1);
      fireEvent.click(await screen.findByRole("button", { name: "Diagnose stellen" }));
      const dialog = screen.getByRole("dialog", { name: "Diagnose stellen für Max Mustermann" });

      fireEvent.click(within(dialog).getByRole("button", { name: "Diagnose stellen" }));

      expect(within(dialog).getByLabelText("Diagnose").getAttribute("aria-invalid")).toBe("true");
      expect(api.commands).toEqual([]);
    });

    it("sollte eine Diagnose ändern", async () => {
      const api = new FakeNaturheilpraxisApi({
        events: [praxisAngelegt(), aufgenommen(max()), { type: "diagnose-gestellt", data: rueckenschmerzen() }],
      });
      zeigePatient(api, 1);
      fireEvent.click(await screen.findByRole("button", { name: "Diagnose bearbeiten" }));
      const dialog = screen.getByRole("dialog", { name: "Diagnose bearbeiten" });
      await within(dialog).findByRole("option", { name: "Naturheilpraxis am Markt (NHP)" });

      eingeben(dialog, "Diagnose", "Lumbago");
      fireEvent.click(within(dialog).getByRole("button", { name: "Speichern" }));

      expect(await screen.findByText("Die Diagnose wurde geändert.")).toBeDefined();
      expect(api.commands).toEqual([
        {
          type: "diagnose-aendern",
          data: {
            diagnoseId: rueckenschmerzen().diagnoseId,
            praxiskuerzel: "NHP",
            datum: "2026-09-14",
            text: "Lumbago",
          },
        },
      ]);
    });

    it("sollte eine Diagnose nach Rückfrage löschen und das Löschen rückgängig machen", async () => {
      const api = new FakeNaturheilpraxisApi({
        events: [praxisAngelegt(), aufgenommen(max()), { type: "diagnose-gestellt", data: rueckenschmerzen() }],
      });
      zeigePatient(api, 1);
      fireEvent.click(await screen.findByRole("button", { name: "Diagnose löschen" }));
      fireEvent.click(
        within(screen.getByRole("dialog", { name: "Diagnose löschen?" })).getByRole("button", { name: "Löschen" }),
      );
      expect(await screen.findByText("Die Diagnose wurde gelöscht.")).toBeDefined();
      expect(await screen.findByText(/Für diesen Patienten wurde noch nichts erfasst/)).toBeDefined();

      fireEvent.click(screen.getByRole("button", { name: "Rückgängig" }));

      expect(await screen.findByText("Chronische Rückenschmerzen")).toBeDefined();
      expect(api.commands).toEqual([
        { type: "diagnose-loeschen", data: { diagnoseId: rueckenschmerzen().diagnoseId } },
        { type: "diagnose-stellen", data: rueckenschmerzen() },
      ]);
    });
  });
});

function zeigePatient(api: NaturheilpraxisApi, patientennummer: number, reiter = "") {
  render(
    <MemoryRouter initialEntries={[`/patienten/${patientennummer}${reiter}`]}>
      <Routes>
        <Route path="/patienten/:patientennummer" element={<PatientPage api={api} reiter="behandlung" />} />
        <Route path="/patienten/:patientennummer/stammdaten" element={<PatientPage api={api} reiter="stammdaten" />} />
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

function rueckenschmerzen(): Diagnose {
  return {
    diagnoseId: "11111111-1111-4111-8111-111111111111",
    praxiskuerzel: "NHP",
    patientennummer: 1,
    datum: "2026-09-14",
    text: "Chronische Rückenschmerzen",
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
