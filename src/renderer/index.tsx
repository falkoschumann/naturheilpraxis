// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "bootstrap";

import "./ui/assets/style.scss";
import App from "./ui/app";

// TODO build, bind, run in program or main: index.tsx at root level
//   using state and onXxx to not calling handlers directly from UI layer
// TODO hold settings in property and use updateSettings method

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
