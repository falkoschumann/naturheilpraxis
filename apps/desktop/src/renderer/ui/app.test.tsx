// Copyright (c) 2026 Falko Schumann. MIT license.

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "./app.tsx";

describe("App", () => {
  it("sollte die Hauptnavigation anzeigen", () => {
    render(<App />);

    const navigation = screen.getByRole("navigation", {
      name: "Hauptnavigation",
    });

    expect(navigation).toBeDefined();
  });
});
