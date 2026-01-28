// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { ReactNode } from "react";

import HeaderComponent from "../components/header_component";

export default function DefaultPageLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <HeaderComponent />
      {children}
    </>
  );
}
