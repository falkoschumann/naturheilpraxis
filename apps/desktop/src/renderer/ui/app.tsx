// Copyright (c) 2026 Falko Schumann. MIT license.

import { HashRouter, Navigate, Route, Routes } from "react-router";

import type { NaturheilpraxisApi } from "../../shared/application/naturheilpraxis-api.ts";
import { MainLayout } from "./layouts/main-layout.tsx";
import { GebuehrenPage } from "./pages/gebuehren-page.tsx";
import { PraxenPage } from "./pages/praxen-page.tsx";

export function App({ api }: { api: NaturheilpraxisApi }) {
  return (
    <HashRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Until there are Patienten, the app starts with the Praxen. */}
          <Route index element={<Navigate to="/praxen" replace />} />
          <Route path="praxen" element={<PraxenPage api={api} />} />
          <Route path="gebuehren" element={<GebuehrenPage api={api} />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
