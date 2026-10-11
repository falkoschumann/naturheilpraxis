// Copyright (c) 2026 Falko Schumann. MIT license.

import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ListHeader, PageHeader } from "./sticky-header.tsx";

describe("Feststehender Kopf", () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 800, 72.5));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sollte die Höhe des Seitenkopfs für die Elemente darunter bereitstellen", () => {
    render(
      <PageHeader>
        <h1>Patienten</h1>
      </PageHeader>,
    );

    expect(screen.getByRole("heading", { name: "Patienten" })).toBeDefined();
    expect(document.documentElement.style.getPropertyValue("--page-header-height")).toBe("72.5px");
  });

  it("sollte die Höhe des Seitenkopfs entfernen, wenn die Seite verlassen wird", () => {
    const { unmount } = render(<PageHeader>Patienten</PageHeader>);

    unmount();

    expect(document.documentElement.style.getPropertyValue("--page-header-height")).toBe("");
  });

  it("sollte die Höhe des Listenkopfs nur innerhalb der Liste bereitstellen", () => {
    render(
      <section aria-label="Rechnungen">
        <ListHeader>
          <h2>Rechnungen</h2>
        </ListHeader>
      </section>,
    );

    const liste = screen.getByRole("region", { name: "Rechnungen" });
    expect(liste.style.getPropertyValue("--list-header-height")).toBe("72.5px");
    expect(document.documentElement.style.getPropertyValue("--list-header-height")).toBe("");
  });
});
