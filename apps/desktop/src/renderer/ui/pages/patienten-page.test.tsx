// Copyright (c) 2026 Falko Schumann. MIT license.

import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { describe, expect, it } from "vitest";

import type { NaturheilpraxisApi } from "../../../shared/application/naturheilpraxis-api.ts";
import type { DomainEvent } from "../../../shared/domain/events.ts";
import { AktuellePraxisContext } from "../layouts/aktuelle-praxis.ts";
import { FakeNaturheilpraxisApi } from "./fake-naturheilpraxis-api.ts";
import { PatientenPage } from "./patienten-page.tsx";

describe("Patienten", () => {
  it("sollte die Patienten anzeigen", async () => {
    const api = new FakeNaturheilpraxisApi({ events: [praxisAngelegt(), maxAufgenommen()] });

    zeigePatienten(api);

    const zeile = await screen.findByRole("row", { name: /Mustermann, Max/ });
    expect(zeile.textContent).toContain("1");
    expect(zeile.textContent).toContain("20.09.1980");
    expect(zeile.textContent).toContain("Musterstadt");
    expect(zeile.textContent).toContain("NHP");
    expect(within(zeile).getByRole("link", { name: "Mustermann, Max" }).getAttribute("href")).toBe("/patienten/1");
  });

  it("sollte einen Hinweis zeigen, wenn noch kein Patient aufgenommen ist", async () => {
    const api = new FakeNaturheilpraxisApi({ events: [praxisAngelegt()] });

    zeigePatienten(api);

    expect(await screen.findByText(/Es ist noch kein Patient aufgenommen/)).toBeDefined();
  });

  it("sollte die Patienten durchsuchen", async () => {
    const api = new FakeNaturheilpraxisApi({ events: [praxisAngelegt(), maxAufgenommen(), erikaAufgenommen()] });
    zeigePatienten(api);
    await screen.findByRole("row", { name: /Mustermann, Erika/ });

    fireEvent.change(screen.getByLabelText("Patienten durchsuchen"), { target: { value: "erika" } });

    await expectKeineZeile(/Mustermann, Max/);
    expect(screen.getByRole("row", { name: /Mustermann, Erika/ })).toBeDefined();
  });

  it("sollte einen Patienten aufnehmen und seine Karteikarte öffnen", async () => {
    const api = new FakeNaturheilpraxisApi({ events: [praxisAngelegt()] });
    zeigePatienten(api);
    fireEvent.click(await screen.findByRole("button", { name: "Patient aufnehmen" }));
    const dialog = screen.getByRole("dialog", { name: "Patient aufnehmen" });
    await within(dialog).findByRole("option", { name: "Naturheilpraxis am Markt (NHP)" });
    expect(within(dialog).getByLabelText("Praxis")).toHaveProperty("value", "NHP");
    expect(document.activeElement).toBe(within(dialog).getByLabelText("Vorname"));

    eingeben(dialog, "Vorname", "Max");
    eingeben(dialog, "Nachname", "Mustermann");
    eingeben(dialog, "Geburtsdatum", "1980-09-20");
    eingeben(dialog, "Straße und Hausnummer", "Lindenweg 5");
    eingeben(dialog, "Postleitzahl", "12345");
    eingeben(dialog, "Ort", "Musterstadt");
    eingeben(dialog, "Schlüsselworte", "Allergie, Rücken");
    fireEvent.click(within(dialog).getByRole("button", { name: "Aufnehmen" }));

    expect(await screen.findByText("Karteikarte 1")).toBeDefined();
    expect(api.commands).toEqual([
      {
        type: "patient-aufnehmen",
        data: {
          praxiskuerzel: "NHP",
          aufnahmejahr: new Date().getFullYear(),
          geburtsdatum: "1980-09-20",
          name: { vorname: "Max", nachname: "Mustermann" },
          anschrift: { strasse: "Lindenweg 5", postleitzahl: "12345", ort: "Musterstadt" },
          schluesselworte: ["Allergie", "Rücken"],
        },
      },
    ]);
  });

  it("sollte eine unvollständige Anschrift markieren", async () => {
    const api = new FakeNaturheilpraxisApi({ events: [praxisAngelegt()] });
    zeigePatienten(api);
    fireEvent.click(await screen.findByRole("button", { name: "Patient aufnehmen" }));
    const dialog = screen.getByRole("dialog", { name: "Patient aufnehmen" });

    eingeben(dialog, "Vorname", "Max");
    eingeben(dialog, "Nachname", "Mustermann");
    eingeben(dialog, "Geburtsdatum", "1980-09-20");
    eingeben(dialog, "Ort", "Musterstadt");
    fireEvent.click(within(dialog).getByRole("button", { name: "Aufnehmen" }));

    expect(within(dialog).getByLabelText("Straße und Hausnummer").getAttribute("aria-invalid")).toBe("true");
    expect(within(dialog).getByLabelText("Postleitzahl").getAttribute("aria-invalid")).toBe("true");
    expect(within(dialog).getByLabelText("Ort").getAttribute("aria-invalid")).toBe("false");
    expect(api.commands).toEqual([]);
  });

  it("sollte mit / die Suche fokussieren", async () => {
    const api = new FakeNaturheilpraxisApi({ events: [praxisAngelegt(), maxAufgenommen()] });
    zeigePatienten(api);
    await screen.findByRole("row", { name: /Mustermann, Max/ });

    fireEvent.keyDown(document.body, { key: "/" });

    expect(document.activeElement).toBe(screen.getByLabelText("Patienten durchsuchen"));
  });

  it("sollte einen Hinweis zeigen, wenn die Suche nichts findet", async () => {
    const api = new FakeNaturheilpraxisApi({ events: [praxisAngelegt(), maxAufgenommen()] });
    zeigePatienten(api);
    await screen.findByRole("row", { name: /Mustermann, Max/ });

    fireEvent.change(screen.getByLabelText("Patienten durchsuchen"), { target: { value: "Unbekannt" } });

    expect(await screen.findByText(/Kein Patient gefunden/)).toBeDefined();
  });

  it("sollte einen Fehler zeigen, wenn die Patienten nicht geladen werden können", async () => {
    const api = new FakeNaturheilpraxisApi();
    api.patientenErmitteln = () => Promise.reject(new Error("IPC nicht erreichbar"));

    zeigePatienten(api);

    expect((await screen.findByRole("alert")).textContent).toContain("Die Patienten konnten nicht geladen werden.");
  });

  it("sollte die Ablehnung der Aufnahme zeigen und die Eingaben behalten", async () => {
    const api = new FakeNaturheilpraxisApi({ events: [praxisAngelegt()] });
    api.patientAufnehmen = () => Promise.reject(new Error("IPC nicht erreichbar"));
    zeigePatienten(api);
    fireEvent.click(await screen.findByRole("button", { name: "Patient aufnehmen" }));
    const dialog = screen.getByRole("dialog", { name: "Patient aufnehmen" });
    await within(dialog).findByRole("option", { name: "Naturheilpraxis am Markt (NHP)" });
    eingeben(dialog, "Vorname", "Max");
    eingeben(dialog, "Nachname", "Mustermann");
    eingeben(dialog, "Geburtsdatum", "1980-09-20");

    fireEvent.click(within(dialog).getByRole("button", { name: "Aufnehmen" }));

    expect((await within(dialog).findByRole("alert")).textContent).toContain(
      "Der Patient konnte nicht aufgenommen werden. Bitte versuchen Sie es erneut.",
    );
    expect(within(dialog).getByLabelText("Vorname")).toHaveProperty("value", "Max");
  });
});

function zeigePatienten(api: NaturheilpraxisApi) {
  render(
    <AktuellePraxisContext value="NHP">
      <MemoryRouter initialEntries={["/patienten"]}>
        <Routes>
          <Route path="/patienten" element={<PatientenPage api={api} />} />
          <Route path="/patienten/:patientennummer" element={<Karteikarte />} />
        </Routes>
      </MemoryRouter>
    </AktuellePraxisContext>,
  );
}

function Karteikarte() {
  const { pathname } = useLocation();
  return <p>Karteikarte {pathname.split("/").at(-1)}</p>;
}

async function expectKeineZeile(name: RegExp) {
  await expect.poll(() => screen.queryByRole("row", { name })).toBeNull();
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

function maxAufgenommen(): DomainEvent {
  return {
    type: "patient-aufgenommen",
    data: {
      patientennummer: 1,
      praxiskuerzel: "NHP",
      aufnahmejahr: 2026,
      geburtsdatum: "1980-09-20",
      name: { vorname: "Max", nachname: "Mustermann" },
      anschrift: { strasse: "Lindenweg 5", postleitzahl: "12345", ort: "Musterstadt" },
    },
  };
}

function erikaAufgenommen(): DomainEvent {
  return {
    type: "patient-aufgenommen",
    data: {
      patientennummer: 2,
      praxiskuerzel: "NHP",
      aufnahmejahr: 2026,
      geburtsdatum: "1982-03-14",
      name: { vorname: "Erika", nachname: "Mustermann" },
    },
  };
}
