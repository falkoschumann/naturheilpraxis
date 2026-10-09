// Copyright (c) 2026 Falko Schumann. MIT license.

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { DomainEvent } from "../../../shared/domain/events.ts";
import { FakeNaturheilpraxisApi } from "./fake-naturheilpraxis-api.ts";
import { GebuehrenPage } from "./gebuehren-page.tsx";

describe("Gebührenverzeichnis", () => {
  it("sollte die Gebühren anzeigen", async () => {
    const api = new FakeNaturheilpraxisApi({ events: [untersuchungAngelegt(), akupunkturAngelegt()] });

    render(<GebuehrenPage api={api} />);

    const zeile = await screen.findByRole("row", { name: /Eingehende Untersuchung/ });
    expect(zeile.textContent).toContain("1");
    expect(zeile.textContent).toContain("20,50 €");
    expect(screen.getByRole("row", { name: /Akupunktur/ })).toBeDefined();
  });

  it("sollte die Gebühren nach Ziffer oder Bezeichnung durchsuchen", async () => {
    const api = new FakeNaturheilpraxisApi({ events: [untersuchungAngelegt(), akupunkturAngelegt()] });
    render(<GebuehrenPage api={api} />);
    await screen.findByRole("row", { name: /Akupunktur/ });

    fireEvent.change(screen.getByLabelText("Gebühren durchsuchen"), { target: { value: "akup" } });

    expect(screen.getByRole("row", { name: /Akupunktur/ })).toBeDefined();
    expect(screen.queryByRole("row", { name: /Eingehende Untersuchung/ })).toBeNull();
  });

  it("sollte eine Gebühr anlegen", async () => {
    const api = new FakeNaturheilpraxisApi();
    render(<GebuehrenPage api={api} />);
    fireEvent.click(await screen.findByRole("button", { name: "Gebühr anlegen" }));
    const dialog = screen.getByRole("dialog", { name: "Gebühr anlegen" });

    eingeben(dialog, "Ziffer", "1");
    eingeben(dialog, "Betrag (€)", "20,50");
    eingeben(dialog, "Bezeichnung", "Eingehende Untersuchung");
    fireEvent.click(within(dialog).getByRole("button", { name: "Gebühr anlegen" }));

    expect(await screen.findByText("Die Gebühr wurde angelegt.")).toBeDefined();
    expect(api.commands).toEqual([
      {
        type: "gebuehr-anlegen",
        data: { ziffer: "1", bezeichnung: "Eingehende Untersuchung", betrag: { cents: 2050 } },
      },
    ]);
    expect(await screen.findByRole("row", { name: /Eingehende Untersuchung/ })).toBeDefined();
  });

  it("sollte einen ungültigen Betrag markieren und die Gebühr nicht anlegen", async () => {
    const api = new FakeNaturheilpraxisApi();
    render(<GebuehrenPage api={api} />);
    fireEvent.click(await screen.findByRole("button", { name: "Gebühr anlegen" }));
    const dialog = screen.getByRole("dialog", { name: "Gebühr anlegen" });

    eingeben(dialog, "Ziffer", "1");
    eingeben(dialog, "Betrag (€)", "zwanzig");
    eingeben(dialog, "Bezeichnung", "Eingehende Untersuchung");
    fireEvent.click(within(dialog).getByRole("button", { name: "Gebühr anlegen" }));

    const betrag = within(dialog).getByLabelText("Betrag (€)");
    expect(betrag.getAttribute("aria-invalid")).toBe("true");
    expect(within(dialog).getByText("Bitte geben Sie einen Betrag wie 12,50 an.")).toBeDefined();
    expect(document.activeElement).toBe(betrag);
    expect(api.commands).toEqual([]);
  });

  it("sollte eine Gebühr ändern", async () => {
    const api = new FakeNaturheilpraxisApi({ events: [untersuchungAngelegt()] });
    render(<GebuehrenPage api={api} />);
    fireEvent.click(await screen.findByRole("button", { name: "Gebühr 1 bearbeiten" }));
    const dialog = screen.getByRole("dialog", { name: "Gebühr 1 bearbeiten" });
    expect(within(dialog).getByLabelText("Ziffer")).toHaveProperty("readOnly", true);
    expect(within(dialog).getByLabelText("Betrag (€)")).toHaveProperty("value", "20,50");

    eingeben(dialog, "Betrag (€)", "23");
    fireEvent.click(within(dialog).getByRole("button", { name: "Speichern" }));

    expect(await screen.findByText("Die Gebühr wurde geändert.")).toBeDefined();
    expect(api.commands).toEqual([
      {
        type: "gebuehr-aendern",
        data: { ziffer: "1", bezeichnung: "Eingehende Untersuchung", betrag: { cents: 2300 } },
      },
    ]);
  });

  it("sollte eine Gebühr nach Rückfrage entfernen", async () => {
    const api = new FakeNaturheilpraxisApi({ events: [untersuchungAngelegt()] });
    render(<GebuehrenPage api={api} />);
    fireEvent.click(await screen.findByRole("button", { name: "Gebühr 1 entfernen" }));
    const dialog = screen.getByRole("dialog", { name: "Gebühr entfernen?" });
    expect(document.activeElement).toBe(within(dialog).getByRole("button", { name: "Entfernen" }));

    fireEvent.click(within(dialog).getByRole("button", { name: "Entfernen" }));

    expect(await screen.findByText("Die Gebühr 1 wurde entfernt.")).toBeDefined();
    expect(api.commands).toEqual([{ type: "gebuehr-entfernen", data: { ziffer: "1" } }]);
    expect(await screen.findByText("Es ist noch keine Gebühr angelegt.", { exact: false })).toBeDefined();
  });

  it("sollte eine Gebühr nicht entfernen, wenn die Rückfrage abgebrochen wird", async () => {
    const api = new FakeNaturheilpraxisApi({ events: [untersuchungAngelegt()] });
    render(<GebuehrenPage api={api} />);
    fireEvent.click(await screen.findByRole("button", { name: "Gebühr 1 entfernen" }));
    const dialog = screen.getByRole("dialog", { name: "Gebühr entfernen?" });

    fireEvent.click(within(dialog).getByRole("button", { name: "Abbrechen" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(api.commands).toEqual([]);
  });

  it("sollte das Entfernen einer Gebühr rückgängig machen", async () => {
    const api = new FakeNaturheilpraxisApi({ events: [untersuchungAngelegt()] });
    render(<GebuehrenPage api={api} />);
    fireEvent.click(await screen.findByRole("button", { name: "Gebühr 1 entfernen" }));
    fireEvent.click(
      within(screen.getByRole("dialog", { name: "Gebühr entfernen?" })).getByRole("button", { name: "Entfernen" }),
    );

    fireEvent.click(await screen.findByRole("button", { name: "Rückgängig" }));

    expect(await screen.findByText("Die Gebühr 1 ist wieder im Gebührenverzeichnis.")).toBeDefined();
    expect(api.commands).toEqual([
      { type: "gebuehr-entfernen", data: { ziffer: "1" } },
      { type: "gebuehr-anlegen", data: untersuchungAngelegt().data },
    ]);
    expect(await screen.findByRole("row", { name: /Eingehende Untersuchung/ })).toBeDefined();
  });
});

function eingeben(container: HTMLElement, label: string, value: string) {
  fireEvent.change(within(container).getByLabelText(label), { target: { value } });
}

function untersuchungAngelegt(): DomainEvent & { type: "gebuehr-angelegt" } {
  return {
    type: "gebuehr-angelegt",
    data: { ziffer: "1", bezeichnung: "Eingehende Untersuchung", betrag: { cents: 2050 } },
  };
}

function akupunkturAngelegt(): DomainEvent {
  return {
    type: "gebuehr-angelegt",
    data: { ziffer: "20.1", bezeichnung: "Akupunktur", betrag: { cents: 1530 } },
  };
}
