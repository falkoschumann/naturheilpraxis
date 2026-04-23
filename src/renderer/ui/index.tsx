// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import "bootstrap";
import { lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router";

import "./assets/bootstrap.scss";
import "./assets/fontawesome.css";
import { PATIENTENKARTEI_PAGE, PATIENTENKARTEIKARTE_PAGE, START_PAGE } from "./components/pages";

const PatientenkarteiPage = lazy(() => import("./pages/patientenkartei"));
const PatientenkarteikartePage = lazy(() => import("./pages/patientenkarteikarte"));
const StartseitePage = lazy(() => import("./pages/startseite"));
const LeistungenComponent = lazy(() => import("./pages/patientenkarteikarte/leistungen"));
const PatientComponent = lazy(() => import("./pages/patientenkarteikarte/patient"));
const RechnungenComponent = lazy(() => import("./pages/patientenkarteikarte/rechnungen"));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={START_PAGE} element={<StartseitePage />} />
        <Route path={PATIENTENKARTEI_PAGE} element={<PatientenkarteiPage />} />
        <Route path={PATIENTENKARTEIKARTE_PAGE} element={<PatientenkarteikartePage />}>
          <Route path=":nummer?" element={<PatientComponent />} />
          <Route path="leistungen" element={<LeistungenComponent />} />
          <Route path="rechnungen" element={<RechnungenComponent />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
