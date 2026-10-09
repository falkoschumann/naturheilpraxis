// Copyright (c) 2026 Falko Schumann. MIT license.

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "./app.tsx";
import { FakeNaturheilpraxisApi } from "./pages/fake-naturheilpraxis-api.ts";

describe("App", () => {
  it("sollte die Hauptnavigation anzeigen", () => {
    render(<App api={new FakeNaturheilpraxisApi()} />);

    const navigation = screen.getByRole("navigation", {
      name: "Hauptnavigation",
    });

    expect(navigation).toBeDefined();
  });

  it("sollte mit den Praxen starten", async () => {
    render(<App api={new FakeNaturheilpraxisApi()} />);

    const heading = await screen.findByRole("heading", { name: "Praxen" });

    expect(heading).toBeDefined();
  });
});
