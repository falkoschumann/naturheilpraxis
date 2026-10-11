// Copyright (c) 2026 Falko Schumann. MIT license.

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { RechnungsvorlagenApi } from "../../../../shared/application/rechnungsvorlagen-api.ts";
import { FakeRechnungsvorlagenApi } from "../../components/fake-rechnungsvorlagen-api.ts";
import { RechnungsvorlagenPage } from "./index.tsx";

describe("Rechnungsvorlagen", () => {
  it("sollte die allgemeine Vorlage und die Vorlagen der Praxen mit Herkunft zeigen", async () => {
    zeige(new FakeRechnungsvorlagenApi());

    const vorlagen = await screen.findByRole("group", { name: "Rechnungsvorlagen" });

    const [allgemein, praxis] = within(vorlagen).getAllByRole("button");
    expect(allgemein?.textContent).toBe("AllgemeinStandardvorlage");
    expect(allgemein?.getAttribute("aria-current")).toBe("true");
    expect(praxis?.textContent).toBe("Naturheilpraxis am Markt(NHP)Allgemeine Vorlage");
  });

  it("sollte die gewählte Vorlage in einer abgeschotteten Vorschau zeigen", async () => {
    zeige(new FakeRechnungsvorlagenApi());

    fireEvent.click(await screen.findByRole("button", { name: /Naturheilpraxis am Markt/ }));

    const vorschau = screen.getByTitle("Vorschau der Rechnungsvorlage");
    expect(vorschau.getAttribute("src")).toBe("app://naturheilpraxis/rechnungsvorlagen/praxen/NHP.html");
    expect(vorschau.getAttribute("sandbox")).toBe("");
    expect(
      screen.getByRole("heading", { level: 2, name: "Naturheilpraxis am Markt: Allgemeine Vorlage" }),
    ).toBeDefined();
  });

  it("sollte die Vorlage exportieren", async () => {
    const rechnungsvorlagen = new FakeRechnungsvorlagenApi();
    zeige(rechnungsvorlagen);

    fireEvent.click(await screen.findByRole("button", { name: "Exportieren …" }));

    expect(await screen.findByText("Die Rechnungsvorlage „Allgemein“ wurde exportiert.")).toBeDefined();
    expect(rechnungsvorlagen.aufrufe).toEqual([{ aktion: "exportieren", geltung: {} }]);
  });

  it("sollte eine eigene Vorlage für die Praxis importieren", async () => {
    const rechnungsvorlagen = new FakeRechnungsvorlagenApi();
    zeige(rechnungsvorlagen);
    fireEvent.click(await screen.findByRole("button", { name: /Naturheilpraxis am Markt/ }));

    fireEvent.click(screen.getByRole("button", { name: "Importieren …" }));

    expect(await screen.findByText("Die Rechnungsvorlage „Naturheilpraxis am Markt“ wurde importiert.")).toBeDefined();
    expect(
      await screen.findByRole("heading", { level: 2, name: "Naturheilpraxis am Markt: Eigene Vorlage" }),
    ).toBeDefined();
    expect(rechnungsvorlagen.aufrufe).toEqual([{ aktion: "importieren", geltung: { praxiskuerzel: "NHP" } }]);
  });

  it("sollte vor dem Ersetzen einer eigenen Vorlage fragen", async () => {
    const rechnungsvorlagen = new FakeRechnungsvorlagenApi({
      vorlagen: [{ bezeichnung: "Allgemein", herkunft: "eigene" }],
    });
    zeige(rechnungsvorlagen);
    fireEvent.click(await screen.findByRole("button", { name: "Importieren …" }));
    const dialog = screen.getByRole("dialog", { name: "Rechnungsvorlage ersetzen?" });
    expect(rechnungsvorlagen.aufrufe).toEqual([]);

    fireEvent.click(within(dialog).getByRole("button", { name: "Datei wählen und ersetzen" }));

    expect(await screen.findByText("Die Rechnungsvorlage „Allgemein“ wurde importiert.")).toBeDefined();
    expect(rechnungsvorlagen.aufrufe).toEqual([{ aktion: "importieren", geltung: {} }]);
  });

  it("sollte die eigene Vorlage der Praxis nach Rückfrage zurücksetzen", async () => {
    const rechnungsvorlagen = new FakeRechnungsvorlagenApi({
      vorlagen: [
        { bezeichnung: "Allgemein", herkunft: "standardvorlage" },
        { praxiskuerzel: "NHP", bezeichnung: "Naturheilpraxis am Markt", herkunft: "eigene" },
      ],
    });
    zeige(rechnungsvorlagen);
    expect(screen.queryByRole("button", { name: "Zurücksetzen" })).toBeNull();
    fireEvent.click(await screen.findByRole("button", { name: /Naturheilpraxis am Markt/ }));
    fireEvent.click(screen.getByRole("button", { name: "Zurücksetzen" }));
    const dialog = screen.getByRole("dialog", { name: "Rechnungsvorlage zurücksetzen?" });
    expect(dialog.textContent).toContain("nutzt dann wieder die allgemeine Vorlage");

    fireEvent.click(within(dialog).getByRole("button", { name: "Zurücksetzen" }));

    expect(
      await screen.findByText("Die Rechnungsvorlage „Naturheilpraxis am Markt“ wurde zurückgesetzt."),
    ).toBeDefined();
    expect(
      await screen.findByRole("heading", { level: 2, name: "Naturheilpraxis am Markt: Allgemeine Vorlage" }),
    ).toBeDefined();
    expect(rechnungsvorlagen.aufrufe).toEqual([{ aktion: "zuruecksetzen", geltung: { praxiskuerzel: "NHP" } }]);
  });

  it("sollte erklären, warum die Vorlage nicht importiert wurde", async () => {
    const rechnungsvorlagen = new FakeRechnungsvorlagenApi({
      status: { completed: false, errorMessage: "Die Platzhalter der Rechnungsvorlage sind fehlerhaft." },
    });
    zeige(rechnungsvorlagen);

    fireEvent.click(await screen.findByRole("button", { name: "Importieren …" }));

    expect(await screen.findByRole("alert")).toHaveProperty(
      "textContent",
      expect.stringContaining("Die Platzhalter der Rechnungsvorlage sind fehlerhaft."),
    );
  });

  it("sollte nichts melden, wenn der Nutzer den Dateidialog abbricht", async () => {
    const rechnungsvorlagen = new FakeRechnungsvorlagenApi({ status: { completed: false } });
    zeige(rechnungsvorlagen);

    fireEvent.click(await screen.findByRole("button", { name: "Importieren …" }));

    await expect.poll(() => screen.getByRole("button", { name: "Importieren …" })).toHaveProperty("disabled", false);
    expect(rechnungsvorlagen.aufrufe).toHaveLength(1);
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

function zeige(rechnungsvorlagen: RechnungsvorlagenApi) {
  render(<RechnungsvorlagenPage rechnungsvorlagen={rechnungsvorlagen} />);
}
