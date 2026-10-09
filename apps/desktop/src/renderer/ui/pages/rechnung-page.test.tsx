// Copyright (c) 2026 Falko Schumann. MIT license.

import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { NaturheilpraxisApi } from "../../../shared/application/naturheilpraxis-api.ts";
import type { DomainEvent } from "../../../shared/domain/events.ts";
import { AbrechnungPage } from "./abrechnung-page.tsx";
import { FakeNaturheilpraxisApi } from "./fake-naturheilpraxis-api.ts";
import { heute } from "./heute.ts";
import { PatientPage } from "./patient-page.tsx";
import { RechnungPage } from "./rechnung-page.tsx";

const ersteLeistung = "22222222-2222-4222-8222-222222222222";
const zweiteLeistung = "23232323-2323-4323-8323-232323232323";
const rechnungId = "33333333-3333-4333-8333-333333333333";

describe("Rechnungen", () => {
  describe("Rechnung erstellen", () => {
    it("sollte nicht abgerechnete Leistungen auf der Karteikarte anzeigen", async () => {
      const api = new FakeNaturheilpraxisApi({ events: grunddaten() });

      zeige(api, "/patienten/1");

      const button = await screen.findByRole("button", { name: "Rechnung erstellen" });
      expect(button.parentElement?.textContent).toContain("2 noch nicht abgerechnete Leistungen über 51,10\u00a0€");
    });

    it("sollte eine Rechnung mit Vorschlägen aus Diagnose, Leistungen und Praxis erstellen", async () => {
      const api = new FakeNaturheilpraxisApi({ events: grunddaten() });
      zeige(api, "/patienten/1");
      fireEvent.click(await screen.findByRole("button", { name: "Rechnung erstellen" }));
      const dialog = screen.getByRole("dialog", { name: "Rechnung erstellen für Max Mustermann" });

      expect(await within(dialog).findByLabelText("Diagnosetext auf der Rechnung")).toHaveProperty(
        "value",
        "Chronische Rückenschmerzen",
      );
      await expect
        .poll(() => (within(dialog).getByLabelText("Rechnungstext") as HTMLTextAreaElement).value)
        .toBe("Bitte überweisen Sie den Betrag innerhalb von 14 Tagen.");
      expect(within(dialog).getByRole("checkbox", { name: "Eingehende Untersuchung vom 14.09.2026" })).toHaveProperty(
        "checked",
        true,
      );
      expect(within(dialog).getByText("51,10 €")).toBeDefined();
      fireEvent.click(within(dialog).getByRole("checkbox", { name: "Akupunktur vom 21.09.2026" }));
      expect(within(dialog).getByText("20,50 €", { selector: "th" })).toBeDefined();
      fireEvent.click(within(dialog).getByRole("button", { name: "Entwurf erstellen" }));

      expect(await screen.findByRole("heading", { level: 1, name: "Rechnungsentwurf" })).toBeDefined();
      expect(api.commands).toEqual([
        {
          type: "rechnung-erstellen",
          data: {
            rechnungId: expect.any(String),
            praxiskuerzel: "NHP",
            patientennummer: 1,
            diagnosetext: "Chronische Rückenschmerzen",
            rechnungstext: "Bitte überweisen Sie den Betrag innerhalb von 14 Tagen.",
            leistungen: [ersteLeistung],
          },
        },
      ]);
    });

    it("sollte eine Rechnung ohne Leistungen nicht erstellen", async () => {
      const api = new FakeNaturheilpraxisApi({ events: grunddaten() });
      zeige(api, "/patienten/1");
      fireEvent.click(await screen.findByRole("button", { name: "Rechnung erstellen" }));
      const dialog = screen.getByRole("dialog", { name: "Rechnung erstellen für Max Mustermann" });
      fireEvent.click(await within(dialog).findByRole("checkbox", { name: "Alle Leistungen auswählen" }));

      fireEvent.click(within(dialog).getByRole("button", { name: "Entwurf erstellen" }));

      expect(within(dialog).getByText("Bitte wählen Sie mindestens eine Leistung aus.")).toBeDefined();
      expect(api.commands).toEqual([]);
    });

    it("sollte die Rechnungen des Patienten im Reiter Rechnungen anzeigen", async () => {
      const api = new FakeNaturheilpraxisApi({ events: [...grunddaten(), rechnungErstellt([ersteLeistung])] });

      zeige(api, "/patienten/1/rechnungen");

      const zeile = await screen.findByRole("row", { name: /Chronische Rückenschmerzen/ });
      expect(zeile.textContent).toContain("Entwurf");
      expect(within(zeile).getByRole("link", { name: "Entwurf" }).getAttribute("href")).toBe(
        `/rechnungen/${rechnungId}`,
      );
    });
  });

  describe("Rechnung", () => {
    it("sollte den Rechnungsentwurf mit Positionen und Gesamtbetrag anzeigen", async () => {
      const api = new FakeNaturheilpraxisApi({
        events: [...grunddaten(), rechnungErstellt([ersteLeistung, zweiteLeistung])],
      });

      zeige(api, `/rechnungen/${rechnungId}`);

      expect(await screen.findByRole("heading", { level: 1, name: "Rechnungsentwurf" })).toBeDefined();
      const rechnung = screen.getByRole("article", { name: "Rechnung" });
      expect(within(rechnung).getByRole("row", { name: /Eingehende Untersuchung/ }).textContent).toContain("20,50");
      expect(within(rechnung).getByText("51,10 €", { selector: "th" })).toBeDefined();
      expect(screen.getByText(/keine vollständige Anschrift/)).toBeDefined();
    });

    it("sollte einen Hinweis zeigen, wenn es die Rechnung nicht gibt", async () => {
      const api = new FakeNaturheilpraxisApi();

      zeige(api, `/rechnungen/${rechnungId}`);

      expect(await screen.findByText(/Diese Rechnung gibt es nicht/)).toBeDefined();
    });

    it("sollte den Entwurf bearbeiten", async () => {
      const api = new FakeNaturheilpraxisApi({
        events: [...grunddaten(), rechnungErstellt([ersteLeistung, zweiteLeistung])],
      });
      zeige(api, `/rechnungen/${rechnungId}`);
      fireEvent.click(await screen.findByRole("button", { name: "Bearbeiten" }));
      const dialog = screen.getByRole("dialog", { name: "Rechnungsentwurf bearbeiten" });
      const zweite = await within(dialog).findByRole("checkbox", { name: "Akupunktur vom 21.09.2026" });
      expect(zweite).toHaveProperty("checked", true);

      fireEvent.click(zweite);
      fireEvent.click(within(dialog).getByRole("button", { name: "Speichern" }));

      expect(await screen.findByText("Der Rechnungsentwurf wurde gespeichert.")).toBeDefined();
      expect(api.commands).toEqual([
        {
          type: "rechnung-aendern",
          data: {
            rechnungId,
            praxiskuerzel: "NHP",
            diagnosetext: "Chronische Rückenschmerzen",
            rechnungstext: "Bitte überweisen Sie den Betrag innerhalb von 14 Tagen.",
            leistungen: [ersteLeistung],
          },
        },
      ]);
    });

    it("sollte den Entwurf nach Rückfrage löschen und zu den Rechnungen des Patienten wechseln", async () => {
      const api = new FakeNaturheilpraxisApi({ events: [...grunddaten(), rechnungErstellt([ersteLeistung])] });
      zeige(api, `/rechnungen/${rechnungId}`);
      fireEvent.click(await screen.findByRole("button", { name: "Entwurf löschen" }));

      fireEvent.click(
        within(screen.getByRole("dialog", { name: "Entwurf löschen?" })).getByRole("button", { name: "Löschen" }),
      );

      expect(await screen.findByText("Der Rechnungsentwurf wurde gelöscht.")).toBeDefined();
      expect(api.commands).toEqual([{ type: "entwurf-loeschen", data: { rechnungId } }]);
      expect(await screen.findByText("Pfad /patienten/1/rechnungen")).toBeDefined();
    });
  });

  describe("Rechnung versenden", () => {
    it("sollte die Rechnung nach Rückfrage versenden", async () => {
      const api = new FakeNaturheilpraxisApi({
        events: [...grunddaten(), anschriftErgaenzt(), rechnungErstellt([ersteLeistung])],
      });
      zeige(api, `/rechnungen/${rechnungId}`);
      fireEvent.click(await screen.findByRole("button", { name: "Versenden" }));
      const dialog = screen.getByRole("dialog", { name: "Rechnung versenden?" });

      fireEvent.click(within(dialog).getByRole("button", { name: "Versenden" }));

      const rechnungsnummer = `1/${heute().slice(2).replaceAll("-", "")}`;
      expect(await screen.findByRole("heading", { level: 1, name: `Rechnung ${rechnungsnummer}` })).toBeDefined();
      expect(screen.getByText(`Die Rechnung ${rechnungsnummer} wurde als versendet markiert.`)).toBeDefined();
      expect(api.commands).toEqual([
        { type: "rechnung-versenden", data: { rechnungId, patientennummer: 1, datum: heute() } },
      ]);
    });

    it("sollte erklären, warum die Rechnung ohne Anschrift nicht versendet wird", async () => {
      const api = new FakeNaturheilpraxisApi({ events: [...grunddaten(), rechnungErstellt([ersteLeistung])] });
      zeige(api, `/rechnungen/${rechnungId}`);
      fireEvent.click(await screen.findByRole("button", { name: "Versenden" }));

      fireEvent.click(
        within(screen.getByRole("dialog", { name: "Rechnung versenden?" })).getByRole("button", { name: "Versenden" }),
      );

      expect(
        await screen.findByText(/Die Rechnung kann nicht versendet werden, weil die Anschrift des Patienten fehlt/),
      ).toBeDefined();
      expect(screen.getByRole("heading", { level: 1, name: "Rechnungsentwurf" })).toBeDefined();
    });

    it("sollte den Versand nach Rückfrage zurücknehmen", async () => {
      const api = new FakeNaturheilpraxisApi({
        events: [...grunddaten(), anschriftErgaenzt(), rechnungErstellt([ersteLeistung]), rechnungVersendet()],
      });
      zeige(api, `/rechnungen/${rechnungId}`);
      fireEvent.click(await screen.findByRole("button", { name: "Versand zurücknehmen" }));

      fireEvent.click(
        within(screen.getByRole("dialog", { name: "Versand zurücknehmen?" })).getByRole("button", {
          name: "Versand zurücknehmen",
        }),
      );

      expect(await screen.findByRole("heading", { level: 1, name: "Rechnungsentwurf" })).toBeDefined();
      expect(screen.getByText("Der Versand wurde zurückgenommen. Die Rechnung ist wieder ein Entwurf.")).toBeDefined();
      expect(api.commands).toEqual([{ type: "rechnung-zurueckstufen", data: { rechnungId } }]);
    });

    it("sollte eine versendete Rechnung drucken", async () => {
      const api = new FakeNaturheilpraxisApi({
        events: [...grunddaten(), anschriftErgaenzt(), rechnungErstellt([ersteLeistung]), rechnungVersendet()],
      });
      const print = vi.spyOn(window, "print").mockImplementation(() => undefined);
      zeige(api, `/rechnungen/${rechnungId}`);

      fireEvent.click(await screen.findByRole("button", { name: "Drucken" }));

      expect(print).toHaveBeenCalledOnce();
      print.mockRestore();
    });

    it("sollte den Fortschritt der Rechnung zeigen", async () => {
      const api = new FakeNaturheilpraxisApi({
        events: [...grunddaten(), anschriftErgaenzt(), rechnungErstellt([ersteLeistung]), rechnungVersendet()],
      });

      zeige(api, `/rechnungen/${rechnungId}`);

      const fortschritt = await screen.findByRole("list", { name: "Fortschritt der Rechnung" });
      expect(within(fortschritt).getByText("Versendet").closest("li")?.getAttribute("aria-current")).toBe("step");
    });
  });

  describe("Abrechnung", () => {
    it("sollte die Rechnungen nach Status filtern", async () => {
      const api = new FakeNaturheilpraxisApi({ events: [...grunddaten(), rechnungErstellt([ersteLeistung])] });
      zeige(api, "/abrechnung");
      expect(await screen.findByRole("row", { name: /Mustermann, Max/ })).toBeDefined();

      fireEvent.click(screen.getByRole("radio", { name: "Bezahlt" }));

      expect(screen.queryByRole("row", { name: /Mustermann, Max/ })).toBeNull();
      expect(screen.getByText("Keine Rechnungen vorhanden.")).toBeDefined();
    });
  });

  describe("Fehler beim Laden", () => {
    it("sollte einen Fehler zeigen, wenn die Rechnungen nicht geladen werden können", async () => {
      zeige(new NichtErreichbareApi(), "/abrechnung");

      expect(await screen.findByRole("alert")).toHaveProperty(
        "textContent",
        "Die Rechnungen konnten nicht geladen werden. Bitte starten Sie die Anwendung neu.",
      );
    });

    it("sollte einen Fehler zeigen, wenn die Rechnungen des Patienten nicht geladen werden können", async () => {
      zeige(new NichtErreichbareApi({ events: grunddaten() }), "/patienten/1/rechnungen");

      expect((await screen.findByRole("alert")).textContent).toContain("Die Rechnungen konnten nicht geladen werden.");
    });

    it("sollte einen Fehler zeigen, wenn die Rechnung nicht geladen werden kann", async () => {
      zeige(new NichtErreichbareApi(), `/rechnungen/${rechnungId}`);

      expect((await screen.findByRole("alert")).textContent).toContain("Die Rechnung konnte nicht geladen werden.");
    });
  });
});

function zeige(api: NaturheilpraxisApi, pfad: string) {
  render(
    <MemoryRouter initialEntries={[pfad]}>
      <Routes>
        <Route path="/patienten/:patientennummer" element={<PatientPage api={api} reiter="behandlung" />} />
        <Route path="/patienten/:patientennummer/rechnungen" element={<PatientPage api={api} reiter="rechnungen" />} />
        <Route path="/rechnungen/:rechnungId" element={<RechnungPage api={api} />} />
        <Route path="/abrechnung" element={<AbrechnungPage api={api} />} />
      </Routes>
      <Pfad />
    </MemoryRouter>,
  );
}

function Pfad() {
  return <p>Pfad {useLocation().pathname}</p>;
}

function grunddaten(): DomainEvent[] {
  return [
    {
      type: "praxis-angelegt",
      data: {
        praxiskuerzel: "NHP",
        name: "Naturheilpraxis am Markt",
        anschrift: { strasse: "Marktplatz 1", postleitzahl: "12345", ort: "Musterstadt" },
        rechnungstext: "Bitte überweisen Sie den Betrag innerhalb von 14 Tagen.",
      },
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
    {
      type: "diagnose-gestellt",
      data: {
        diagnoseId: "11111111-1111-4111-8111-111111111111",
        praxiskuerzel: "NHP",
        patientennummer: 1,
        datum: "2026-09-14",
        text: "Chronische Rückenschmerzen",
      },
    },
    {
      type: "leistung-erbracht",
      data: {
        leistungId: ersteLeistung,
        praxiskuerzel: "NHP",
        patientennummer: 1,
        datum: "2026-09-14",
        ziffer: "1",
        bezeichnung: "Eingehende Untersuchung",
        anzahl: 1,
        einzelbetrag: { cents: 2050 },
      },
    },
    {
      type: "leistung-erbracht",
      data: {
        leistungId: zweiteLeistung,
        praxiskuerzel: "NHP",
        patientennummer: 1,
        datum: "2026-09-21",
        ziffer: "20.1",
        bezeichnung: "Akupunktur",
        anzahl: 2,
        einzelbetrag: { cents: 1530 },
      },
    },
  ];
}

function anschriftErgaenzt(): DomainEvent {
  return {
    type: "patientendaten-geaendert",
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

function rechnungVersendet(): DomainEvent {
  return {
    type: "rechnung-versendet",
    data: { rechnungId, patientennummer: 1, rechnungsnummer: "1/260920", datum: "2026-09-20" },
  };
}

function rechnungErstellt(leistungen: string[]): DomainEvent {
  return {
    type: "rechnung-erstellt",
    data: {
      rechnungId,
      praxiskuerzel: "NHP",
      patientennummer: 1,
      diagnosetext: "Chronische Rückenschmerzen",
      rechnungstext: "Bitte überweisen Sie den Betrag innerhalb von 14 Tagen.",
      leistungen,
    },
  };
}

// The main process does not answer queries about Rechnungen.
class NichtErreichbareApi extends FakeNaturheilpraxisApi {
  override async rechnungenErmitteln(): Promise<never> {
    throw new Error("IPC nicht erreichbar");
  }

  override async rechnungErmitteln(): Promise<never> {
    throw new Error("IPC nicht erreichbar");
  }
}
