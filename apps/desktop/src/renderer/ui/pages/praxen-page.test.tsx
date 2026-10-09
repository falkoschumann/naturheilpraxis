// Copyright (c) 2026 Falko Schumann. MIT license.

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Praxis } from "../../../shared/domain/entities.ts";
import { FakeNaturheilpraxisApi } from "./fake-naturheilpraxis-api.ts";
import { PraxenPage } from "./praxen-page.tsx";

describe("Praxen", () => {
  it("sollte die Praxen anzeigen", async () => {
    const api = new FakeNaturheilpraxisApi({ events: [{ type: "praxis-angelegt", data: createPraxis() }] });

    render(<PraxenPage api={api} />);

    const karte = await screen.findByRole("article", {
      name: "Naturheilpraxis am Markt",
    });
    expect(karte.textContent).toContain("NHP");
    expect(karte.textContent).toContain("Marktplatz 1");
    expect(karte.textContent).toContain("12345 Musterstadt");
  });

  it("sollte einen Hinweis zeigen, wenn noch keine Praxis angelegt ist", async () => {
    const api = new FakeNaturheilpraxisApi();

    render(<PraxenPage api={api} />);

    expect(await screen.findByText(/Es ist noch keine Praxis angelegt/)).toBeDefined();
  });

  it("sollte eine Praxis anlegen", async () => {
    const api = new FakeNaturheilpraxisApi();
    render(<PraxenPage api={api} />);
    fireEvent.click(await screen.findByRole("button", { name: "Praxis anlegen" }));
    const dialog = screen.getByRole("dialog", { name: "Praxis anlegen" });
    expect(document.activeElement).toBe(within(dialog).getByLabelText("Praxiskürzel"));

    eingeben(dialog, "Praxiskürzel", "nhp");
    eingeben(dialog, "Name", "Naturheilpraxis am Markt");
    eingeben(dialog, "Straße und Hausnummer", "Marktplatz 1");
    eingeben(dialog, "Postleitzahl", "12345");
    eingeben(dialog, "Ort", "Musterstadt");
    eingeben(dialog, "Telefon", "0123 456789");
    fireEvent.click(within(dialog).getByRole("button", { name: "Praxis anlegen" }));

    expect(await screen.findByText("Die Praxis wurde angelegt.")).toBeDefined();
    expect(api.commands).toEqual([
      {
        type: "praxis-anlegen",
        data: {
          praxiskuerzel: "NHP",
          name: "Naturheilpraxis am Markt",
          anschrift: {
            strasse: "Marktplatz 1",
            postleitzahl: "12345",
            ort: "Musterstadt",
          },
          kontakt: { telefon: "0123 456789" },
        },
      },
    ]);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(await screen.findByRole("article", { name: "Naturheilpraxis am Markt" })).toBeDefined();
  });

  it("sollte fehlende Pflichtfelder markieren und die Praxis nicht anlegen", async () => {
    const api = new FakeNaturheilpraxisApi();
    render(<PraxenPage api={api} />);
    fireEvent.click(await screen.findByRole("button", { name: "Praxis anlegen" }));
    const dialog = screen.getByRole("dialog", { name: "Praxis anlegen" });

    eingeben(dialog, "Name", "Naturheilpraxis am Markt");
    fireEvent.click(within(dialog).getByRole("button", { name: "Praxis anlegen" }));

    expect(within(dialog).getByRole("alert").textContent).toContain("Bitte prüfen Sie die markierten Felder.");
    const kuerzel = within(dialog).getByLabelText("Praxiskürzel");
    expect(kuerzel.getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(kuerzel);
    expect(within(dialog).getByLabelText("Name")).toHaveProperty("value", "Naturheilpraxis am Markt");
    expect(api.commands).toEqual([]);
  });

  it("sollte die Ablehnung zeigen und die Eingaben behalten", async () => {
    const api = new FakeNaturheilpraxisApi({ events: [{ type: "praxis-angelegt", data: createPraxis() }] });
    render(<PraxenPage api={api} />);
    fireEvent.click(await screen.findByRole("button", { name: "Praxis anlegen" }));
    const dialog = screen.getByRole("dialog", { name: "Praxis anlegen" });

    eingeben(dialog, "Praxiskürzel", "NHP");
    eingeben(dialog, "Name", "Naturheilpraxis am Markt");
    eingeben(dialog, "Straße und Hausnummer", "Marktplatz 1");
    eingeben(dialog, "Postleitzahl", "12345");
    eingeben(dialog, "Ort", "Musterstadt");
    fireEvent.click(within(dialog).getByRole("button", { name: "Praxis anlegen" }));

    expect((await within(dialog).findByRole("alert")).textContent).toContain(
      "Eine Praxis mit dem Kürzel „NHP“ ist bereits angelegt.",
    );
    expect(within(dialog).getByLabelText("Praxiskürzel")).toHaveProperty("value", "NHP");
  });

  it("sollte die Praxisdaten ändern", async () => {
    const api = new FakeNaturheilpraxisApi({ events: [{ type: "praxis-angelegt", data: createPraxis() }] });
    render(<PraxenPage api={api} />);
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Naturheilpraxis am Markt bearbeiten",
      }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Praxis bearbeiten",
    });
    expect(within(dialog).getByLabelText("Praxiskürzel")).toHaveProperty("readOnly", true);

    eingeben(dialog, "Name", "Naturheilpraxis am Brunnen");
    fireEvent.click(within(dialog).getByRole("button", { name: "Speichern" }));

    expect(await screen.findByText("Die Praxisdaten wurden geändert.")).toBeDefined();
    expect(api.commands).toEqual([
      {
        type: "praxisdaten-aendern",
        data: createPraxis({ name: "Naturheilpraxis am Brunnen" }),
      },
    ]);
  });
});

function eingeben(container: HTMLElement, label: string, value: string) {
  fireEvent.change(within(container).getByLabelText(label), {
    target: { value },
  });
}

function createPraxis(praxis: Partial<Praxis> = {}): Praxis {
  return {
    praxiskuerzel: "NHP",
    name: "Naturheilpraxis am Markt",
    anschrift: {
      strasse: "Marktplatz 1",
      postleitzahl: "12345",
      ort: "Musterstadt",
    },
    ...praxis,
  };
}
