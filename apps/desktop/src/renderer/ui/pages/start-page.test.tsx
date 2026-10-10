// Copyright (c) 2026 Falko Schumann. MIT license.

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FakeDatabaseApi } from "./fake-database-api.ts";
import { StartPage } from "./start-page.tsx";

describe("Startseite", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sollte unter macOS auf das Menü Ablage verweisen", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)");

    render(<StartPage database={new FakeDatabaseApi({ status: {} })} status={{}} onOpened={vi.fn()} />);

    expect(screen.getByText("Ablage")).toBeDefined();
  });

  it("sollte unter anderen Systemen auf das Menü Datei verweisen", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");

    render(<StartPage database={new FakeDatabaseApi({ status: {} })} status={{}} onOpened={vi.fn()} />);

    expect(screen.getByText("Datei")).toBeDefined();
  });

  it("sollte eine neue Datenbank anlegen", async () => {
    const database = new FakeDatabaseApi({
      status: {},
      answers: [{ filename: "/daten/neu.db" }],
    });
    const onOpened = vi.fn();
    render(<StartPage database={database} status={{}} onOpened={onOpened} />);

    fireEvent.click(screen.getByRole("button", { name: "Neue Datenbank anlegen…" }));

    await vi.waitFor(() => expect(onOpened).toHaveBeenCalledWith({ filename: "/daten/neu.db" }));
  });

  it("sollte eine vorhandene Datenbank öffnen", async () => {
    const database = new FakeDatabaseApi({
      status: {},
      answers: [{ filename: "/daten/praxis.db" }],
    });
    const onOpened = vi.fn();
    render(<StartPage database={database} status={{}} onOpened={onOpened} />);

    fireEvent.click(screen.getByRole("button", { name: "Vorhandene Datenbank öffnen…" }));

    await vi.waitFor(() => expect(onOpened).toHaveBeenCalledWith({ filename: "/daten/praxis.db" }));
  });

  it("sollte nichts tun, wenn der Nutzer den Dialog abbricht", async () => {
    const database = new FakeDatabaseApi({ status: {} });
    const onOpened = vi.fn();
    render(<StartPage database={database} status={{}} onOpened={onOpened} />);

    fireEvent.click(screen.getByRole("button", { name: "Vorhandene Datenbank öffnen…" }));

    await vi.waitFor(() =>
      expect(screen.getByRole("button", { name: "Vorhandene Datenbank öffnen…" })).toHaveProperty("disabled", false),
    );
    expect(onOpened).not.toHaveBeenCalled();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("sollte den Fehler anzeigen, wenn die Datenbank nicht geöffnet werden kann", async () => {
    const database = new FakeDatabaseApi({
      status: {},
      answers: [{ errorMessage: "Die Datei „/daten/notiz.txt“ ist keine Datenbank der Naturheilpraxis." }],
    });
    render(<StartPage database={database} status={{}} onOpened={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Vorhandene Datenbank öffnen…" }));

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Die Datei „/daten/notiz.txt“ ist keine Datenbank der Naturheilpraxis.",
    );
  });

  it("sollte die fehlende Datenbank erneut öffnen", async () => {
    const status = {
      errorMessage: "Die Datenbank „/netz/praxis.db“ wurde nicht gefunden.",
      retryFilename: "/netz/praxis.db",
    };
    const database = new FakeDatabaseApi({
      status,
      answers: [{ filename: "/netz/praxis.db" }],
    });
    const onOpened = vi.fn();
    render(<StartPage database={database} status={status} onOpened={onOpened} />);
    expect(screen.getByRole("alert").textContent).toContain("Die Datenbank „/netz/praxis.db“ wurde nicht gefunden.");

    fireEvent.click(screen.getByRole("button", { name: "Erneut versuchen" }));

    await vi.waitFor(() => expect(onOpened).toHaveBeenCalledWith({ filename: "/netz/praxis.db" }));
  });

  it("sollte erneut versuchen nur für eine fehlende Datenbank anbieten", () => {
    render(<StartPage database={new FakeDatabaseApi({ status: {} })} status={{}} onOpened={vi.fn()} />);

    expect(screen.queryByRole("button", { name: "Erneut versuchen" })).toBeNull();
  });
});
