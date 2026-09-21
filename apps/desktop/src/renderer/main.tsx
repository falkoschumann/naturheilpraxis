// Copyright (c) 2026 Falko Schumann. MIT license.

import "./ui/theme.scss";
import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/solid.min.css";
import "bootstrap";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./ui/app.tsx";

const container = document.getElementById("root");
if (container === null) {
  throw new Error("The element #root is missing in index.html.");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
