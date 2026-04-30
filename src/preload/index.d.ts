// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export interface Naturheilpraxis {
  nimmPatientAuf(command: string): Promise<string>;

  suchePatient(query: string): Promise<string>;

  suchePatienten(query: string): Promise<string>;

  sucheLeistungen(query: string): Promise<string>;

  sucheRechnungen(query: string): Promise<string>;
}

declare global {
  interface Window {
    naturheilpraxis: Naturheilpraxis;
  }
}
