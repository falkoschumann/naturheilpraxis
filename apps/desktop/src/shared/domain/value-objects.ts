// Copyright (c) 2026 Falko Schumann. MIT license.

export type Anschrift = Readonly<{
  strasse: string;
  zusatz?: string;
  postleitzahl: string;
  ort: string;
  staat?: string;
}>;

export type Kontakt = Readonly<{
  telefon?: string;
  mobiltelefon?: string;
  email?: string;
  website?: string;
}>;
