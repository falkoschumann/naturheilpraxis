// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useEffect } from "react";

import Patientenkarteikarte from "./patientenkarteikarte";

export default function App() {
  useEffect(() => {
    (async function () {
      const response = await window.versions.ping();
      console.log(response); // prints out 'pong'
    })();
  }, []);

  return (
    <>
      <Patientenkarteikarte />
      <p>
        This app is using Chrome (v{window.versions.chrome()}), Node.js (v{window.versions.node()}), and Electron (v
        {window.versions.electron()})
      </p>
    </>
  );
}
