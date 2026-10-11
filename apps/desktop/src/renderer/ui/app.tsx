// Copyright (c) 2026 Falko Schumann. MIT license.

import { useEffect, useState } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router";

import type { DatabaseApi, DatabaseStatus } from "../../shared/application/database-api.ts";
import type { NaturheilpraxisApi } from "../../shared/application/naturheilpraxis-api.ts";
import type { PrintApi } from "../../shared/application/print-api.ts";
import { MainLayout } from "./layouts/main-layout.tsx";
import { AbrechnungPage } from "./pages/abrechnung-page.tsx";
import { GebuehrenPage } from "./pages/gebuehren-page.tsx";
import { PatientPage } from "./pages/patient-page.tsx";
import { PatientenPage } from "./pages/patienten-page.tsx";
import { PraxenPage } from "./pages/praxen-page.tsx";
import { RechnungPage } from "./pages/rechnung-page.tsx";
import { StartPage } from "./pages/start-page.tsx";

// Without an open database the start page asks for one.
export function App({ api, database, printer }: { api: NaturheilpraxisApi; database: DatabaseApi; printer: PrintApi }) {
  const [status, setStatus] = useState<DatabaseStatus>();

  useEffect(() => {
    let aktuell = true;
    database.getStatus().then(
      (status) => {
        if (aktuell) {
          setStatus(status);
        }
      },
      () => {
        if (aktuell) {
          setStatus({
            errorMessage: "Die Datenbank konnte nicht ermittelt werden. Bitte starten Sie die Anwendung neu.",
          });
        }
      },
    );
    return () => {
      aktuell = false;
    };
  }, [database]);

  if (status === undefined) {
    return null;
  }
  if (status.filename === undefined) {
    return <StartPage database={database} status={status} onOpened={setStatus} />;
  }
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
          <Route path="rechnungen/:rechnungId" element={<RechnungPage api={api} printer={printer} />} />
          <Route path="praxen" element={<PraxenPage api={api} />} />
          <Route path="gebuehren" element={<GebuehrenPage api={api} />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
