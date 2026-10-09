// Copyright (c) 2026 Falko Schumann. MIT license.

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import type { DomainEvent } from "../../shared/domain/events.ts";
import { App } from "./app.tsx";
import { FakeNaturheilpraxisApi } from "./pages/fake-naturheilpraxis-api.ts";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = "";
  });

  it("sollte die Hauptnavigation anzeigen", () => {
    render(<App api={new FakeNaturheilpraxisApi()} />);

    const navigation = screen.getByRole("navigation", { name: "Hauptnavigation" });

    expect(navigation).toBeDefined();
  });

  it("sollte mit den Patienten starten", async () => {
    render(<App api={new FakeNaturheilpraxisApi()} />);

    const heading = await screen.findByRole("heading", { name: "Patienten" });

    expect(heading).toBeDefined();
  });

  it("sollte die erste Praxis als aktuelle Praxis wählen", async () => {
    render(<App api={new FakeNaturheilpraxisApi({ events: [praxisAngelegt("ABC"), praxisAngelegt("NHP")] })} />);

    await screen.findByRole("option", { name: "Praxis NHP" });

    expect(screen.getByLabelText("Aktuelle Praxis")).toHaveProperty("value", "ABC");
  });

  it("sollte die aktuelle Praxis wechseln und merken", async () => {
    const api = new FakeNaturheilpraxisApi({ events: [praxisAngelegt("ABC"), praxisAngelegt("NHP")] });
    const { unmount } = render(<App api={api} />);
    await screen.findByRole("option", { name: "Praxis NHP" });

    fireEvent.change(screen.getByLabelText("Aktuelle Praxis"), { target: { value: "NHP" } });

    expect(screen.getByText("Neue Einträge werden jetzt in der Praxis „Praxis NHP“ erfasst.")).toBeDefined();
    unmount();
    render(<App api={api} />);
    await screen.findByRole("option", { name: "Praxis NHP" });
    expect(screen.getByLabelText("Aktuelle Praxis")).toHaveProperty("value", "NHP");
  });
});

function praxisAngelegt(praxiskuerzel: string): DomainEvent {
  return {
    type: "praxis-angelegt",
    data: {
      praxiskuerzel,
      name: `Praxis ${praxiskuerzel}`,
      anschrift: { strasse: "Marktplatz 1", postleitzahl: "12345", ort: "Musterstadt" },
    },
  };
}
