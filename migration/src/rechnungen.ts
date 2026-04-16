// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { InvoiceDto } from "./legacy_database_gateway";

import { Rechnung } from "../../src/shared/domain/rechnung";
import {
  normalisiereBoolean,
  normalisiereNumber,
  normalisiereString,
} from "./migration";

export function erstelleRechnungen(invoices: InvoiceDto[]): Rechnung[] {
  return invoices.map((invoice) => erstelleRechnung(invoice));
}

function erstelleRechnung(invoice: InvoiceDto) {
  const id = normalisiereNumber(invoice.id);
  const praxis = normalisiereString(invoice.agency);
  const nummer = normalisiereString(invoice.invoiceNumber);
  const datum = normalisiereString(invoice.date);
  const patientId = normalisiereNumber(invoice.customerId);
  const rechnungstext = normalisiereString(invoice.invoiceNote);
  const kommentar = normalisiereString(invoice.comment);
  const bezahlt = normalisiereBoolean(invoice.cleared);
  const gutschrift = normalisiereBoolean(invoice.creditNote);
  const rechnung = prüfeVollständigkeit({
    rechnung: {
      id,
      praxis,
      nummer,
      datum,
      patientId,
      rechnungstext,
      kommentar,
      bezahlt,
      gutschrift,
    },
    onError: (fehlendeDaten) => {
      const fehlendeDatenString = fehlendeDaten.join(", ");
      console.warn(
        `  Unvollständiger Datensatz für ${id}, vermisse ${fehlendeDatenString}`,
      );
    },
  });
  return Rechnung.create(rechnung);
}

function prüfeVollständigkeit({
  rechnung,
  onError,
}: {
  rechnung: {
    id?: number;
    praxis?: string;
    nummer?: string;
    datum?: string;
    patientId?: number;
    rechnungstext?: string;
    kommentar?: string;
    bezahlt?: boolean;
    gutschrift?: boolean;
  };
  onError: (fehlendeDaten: string[]) => void;
}) {
  const { id, rechnungstext, kommentar, bezahlt, gutschrift } = rechnung;
  let { praxis, nummer, datum, patientId } = rechnung;
  const fehlendeDaten: string[] = [];
  if (id == null) {
    throw new Error("Rechnung hat keine ID.");
  }
  if (praxis == null) {
    fehlendeDaten.push("Praxis");
    praxis = "N/A";
  }
  if (nummer == null) {
    fehlendeDaten.push("Rechnungsnummer");
    nummer = "N/A";
  }
  if (datum == null) {
    fehlendeDaten.push("Datum");
    datum = "1970-01-01";
  }
  if (patientId == null) {
    fehlendeDaten.push("Patient");
    patientId = 1;
  }
  if (fehlendeDaten.length > 0) {
    onError(fehlendeDaten);
  }
  return {
    id,
    praxis,
    nummer,
    datum,
    patientId,
    rechnungstext,
    kommentar,
    bezahlt,
    gutschrift,
  };
}
