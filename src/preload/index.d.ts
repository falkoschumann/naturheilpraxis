// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export interface Naturheilpraxis {
  nimmPatientAuf(command: string): Promise<string>;

  suchePatient(query: string): Promise<string>;

  suchePatienten(query: string): Promise<string>;

  ladeEinstellungen(): Promise<string>;

  sichereEinstellungen(einstellungen: string): Promise<void>;
}

declare global {
  interface Window {
    naturheilpraxis: Naturheilpraxis;
  }
}
