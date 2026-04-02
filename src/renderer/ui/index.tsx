// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import "bootstrap";
import { BrowserRouter, Route, Routes } from "react-router";

import "./assets/bootstrap.scss";
import "./assets/fontawesome.css";
import { PATIENTENKARTEI_PAGE, PATIENTENKARTEIKARTE_PAGE, START_PAGE } from "./components/pages";
import PatientenkarteiPage from "./pages/patientenkartei";
import PatientenkarteikartePage from "./pages/patientenkarteikarte";
import StartseitePage from "./pages/startseite";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={START_PAGE} element={<StartseitePage />} />
        <Route path={PATIENTENKARTEI_PAGE} element={<PatientenkarteiPage />} />
        <Route path={PATIENTENKARTEIKARTE_PAGE} element={<PatientenkarteikartePage />} />
      </Routes>
    </BrowserRouter>
  );
}
