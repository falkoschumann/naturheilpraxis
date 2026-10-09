// Copyright (c) 2026 Falko Schumann. MIT license.

import { HashRouter, Navigate, Route, Routes } from "react-router";

import type { NaturheilpraxisApi } from "../../shared/application/naturheilpraxis-api.ts";
import { MainLayout } from "./layouts/main-layout.tsx";
import { AbrechnungPage } from "./pages/abrechnung-page.tsx";
import { GebuehrenPage } from "./pages/gebuehren-page.tsx";
import { PatientPage } from "./pages/patient-page.tsx";
import { PatientenPage } from "./pages/patienten-page.tsx";
import { PraxenPage } from "./pages/praxen-page.tsx";
import { RechnungPage } from "./pages/rechnung-page.tsx";

export function App({ api }: { api: NaturheilpraxisApi }) {
  return (
    <HashRouter>
      <Routes>
        <Route element={<MainLayout api={api} />}>
          <Route index element={<Navigate to="/patienten" replace />} />
          <Route path="patienten" element={<PatientenPage api={api} />} />
          <Route path="patienten/:patientennummer" element={<PatientPage api={api} reiter="behandlung" />} />
          <Route path="patienten/:patientennummer/stammdaten" element={<PatientPage api={api} reiter="stammdaten" />} />
          <Route path="patienten/:patientennummer/rechnungen" element={<PatientPage api={api} reiter="rechnungen" />} />
          <Route path="abrechnung" element={<AbrechnungPage api={api} />} />
          <Route path="rechnungen/:rechnungId" element={<RechnungPage api={api} />} />
          <Route path="praxen" element={<PraxenPage api={api} />} />
          <Route path="gebuehren" element={<GebuehrenPage api={api} />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
