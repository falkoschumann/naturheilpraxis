// Copyright (c) 2026 Falko Schumann. MIT license.

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { NaturheilpraxisApi } from "../../shared/application/naturheilpraxis-api.ts";
import { App } from "./app.tsx";

describe("App", () => {
  it("sollte die Hauptnavigation anzeigen", () => {
    render(<App api={createApi()} />);

    const navigation = screen.getByRole("navigation", {
      name: "Hauptnavigation",
    });

    expect(navigation).toBeDefined();
  });

  it("sollte mit den Praxen starten", async () => {
    render(<App api={createApi()} />);

    const heading = await screen.findByRole("heading", { name: "Praxen" });

    expect(heading).toBeDefined();
  });
});

function createApi(): NaturheilpraxisApi {
  return {
    praxisAnlegen: async () => ({ success: true }),
    praxisdatenAendern: async () => ({ success: true }),
    praxenErmitteln: async () => [],
    praxisErmitteln: async () => undefined,
  };
}
