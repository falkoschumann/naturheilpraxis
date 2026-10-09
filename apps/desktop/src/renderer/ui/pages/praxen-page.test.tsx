// Copyright (c) 2026 Falko Schumann. MIT license.

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { CommandStatus, NaturheilpraxisApi } from "../../../shared/application/naturheilpraxis-api.ts";
import type { Praxis } from "../../../shared/domain/entities.ts";
import type { PraxenErmittelnQueryResult, PraxisErmittelnQueryResult } from "../../../shared/domain/praxenansicht.ts";
import type { PraxisAnlegenCommand, PraxisdatenAendernCommand } from "../../../shared/domain/praxisverwaltung.ts";
import { PraxenPage } from "./praxen-page.tsx";

describe("Praxen", () => {
  it("sollte die Praxen anzeigen", async () => {
    const api = new FakeApi({ praxen: [createPraxis()] });

    render(<PraxenPage api={api} />);

    const karte = await screen.findByRole("article", {
      name: "Naturheilpraxis am Markt",
    });
    expect(karte.textContent).toContain("NHP");
    expect(karte.textContent).toContain("Marktplatz 1");
    expect(karte.textContent).toContain("12345 Musterstadt");
  });

  it("sollte einen Hinweis zeigen, wenn noch keine Praxis angelegt ist", async () => {
    const api = new FakeApi();

    render(<PraxenPage api={api} />);

    expect(await screen.findByText(/Es ist noch keine Praxis angelegt/)).toBeDefined();
  });

  it("sollte eine Praxis anlegen", async () => {
    const api = new FakeApi();
    render(<PraxenPage api={api} />);
    fireEvent.click(await screen.findByRole("button", { name: "Praxis anlegen" }));
    const dialog = screen.getByRole("dialog", { name: "Praxis anlegen" });

    eingeben(dialog, "Praxiskürzel", "nhp");
    eingeben(dialog, "Name", "Naturheilpraxis am Markt");
    eingeben(dialog, "Straße und Hausnummer", "Marktplatz 1");
    eingeben(dialog, "Postleitzahl", "12345");
    eingeben(dialog, "Ort", "Musterstadt");
    eingeben(dialog, "Telefon", "0123 456789");
    fireEvent.click(within(dialog).getByRole("button", { name: "Praxis anlegen" }));

    expect(await screen.findByText("Die Praxis wurde angelegt.")).toBeDefined();
    expect(api.anlegen).toEqual([
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
    const api = new FakeApi();
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
    expect(api.anlegen).toEqual([]);
  });

  it("sollte die Ablehnung zeigen und die Eingaben behalten", async () => {
    const api = new FakeApi({
      status: {
        success: false,
        errorMessage: "Eine Praxis mit dem Kürzel „NHP“ ist bereits angelegt. Bitte wählen Sie ein anderes Kürzel.",
      },
    });
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
    const api = new FakeApi({ praxen: [createPraxis()] });
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
    expect(api.aendern).toEqual([
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

// Keeps the Praxen in memory and records the commands.
class FakeApi implements NaturheilpraxisApi {
  readonly anlegen: PraxisAnlegenCommand[] = [];
  readonly aendern: PraxisdatenAendernCommand[] = [];

  readonly #praxen: Praxis[];
  readonly #status: CommandStatus;

  constructor({ praxen = [], status = { success: true } }: { praxen?: Praxis[]; status?: CommandStatus } = {}) {
    this.#praxen = [...praxen];
    this.#status = status;
  }

  async praxisAnlegen(command: PraxisAnlegenCommand): Promise<CommandStatus> {
    this.anlegen.push(command);
    if (this.#status.success) {
      this.#praxen.push(command.data);
    }
    return this.#status;
  }

  async praxisdatenAendern(command: PraxisdatenAendernCommand): Promise<CommandStatus> {
    this.aendern.push(command);
    return this.#status;
  }

  async praxenErmitteln(): Promise<PraxenErmittelnQueryResult> {
    return this.#praxen.map(({ anschrift, kontakt, ...praxis }) => ({
      ...praxis,
      ...anschrift,
      ...kontakt,
    }));
  }

  async praxisErmitteln(): Promise<PraxisErmittelnQueryResult> {
    return this.#praxen[0];
  }
}
