// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Route, Routes } from "react-router";

import { PATIENTENKARTEI_PAGE, PATIENTENKARTEIKARTE_PAGE, START_PAGE } from "./components/pages";
import PatientenkarteiPage from "./pages/patientenkartei";
import PatientenkarteikartePage from "./pages/patientenkarteikarte";
import StartseitePage from "./pages/startseite";

export default function App() {
  return (
    <>
      <Routes>
        <Route path={START_PAGE} element={<StartseitePage />} />
        <Route path={PATIENTENKARTEI_PAGE} element={<PatientenkarteiPage />} />
        <Route path={PATIENTENKARTEIKARTE_PAGE} element={<PatientenkarteikartePage />} />
        <Route path={PATIENTENKARTEIKARTE_PAGE} element={<PatientenkarteikartePage />} />
      </Routes>
    </>
  );
}
