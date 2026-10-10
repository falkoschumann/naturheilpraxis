// Copyright (c) 2026 Falko Schumann. MIT license.

import "./ui/theme.scss";
import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/solid.min.css";
import "bootstrap";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import type { DatabaseApi } from "../shared/application/database-api.ts";
import type { NaturheilpraxisApi } from "../shared/application/naturheilpraxis-api.ts";
import { App } from "./ui/app.tsx";

declare global {
  interface Window {
    // Provided by the preload script.
    readonly naturheilpraxis: NaturheilpraxisApi;
    readonly database: DatabaseApi;
  }
}

const container = document.getElementById("root");
if (container === null) {
  throw new Error("The element #root is missing in index.html.");
}

createRoot(container).render(
  <StrictMode>
    <App api={window.naturheilpraxis} database={window.database} />
  </StrictMode>,
);
