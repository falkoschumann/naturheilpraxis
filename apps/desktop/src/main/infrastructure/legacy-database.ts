// Copyright (c) 2026 Falko Schumann. MIT license.

import { DatabaseSync, type SQLOutputValue } from "node:sqlite";

import type {
  LegacyActivity,
  LegacyAmount,
  LegacyData,
  LegacyFee,
  LegacyInvoice,
  LegacyPatient,
} from "../domain/legacy-migration.ts";

type Row = Record<string, SQLOutputValue>;

// A missing column has no value like NULL.
type Value = SQLOutputValue | undefined;

// Reads the SQLite database of the legacy application. The columns have no
// strict types, so a numeric column may hold text and vice versa.
export class LegacyDatabase {
  static open(filename: string): LegacyDatabase {
    return new LegacyDatabase(new DatabaseSync(filename, { readOnly: true }));
  }

  static fromDatabase(database: DatabaseSync): LegacyDatabase {
    return new LegacyDatabase(database);
  }

  readonly #database: DatabaseSync;

  private constructor(database: DatabaseSync) {
    this.#database = database;
  }

  read(): LegacyData {
    return {
      fees: this.#readFees(),
      patients: this.#readPatients(),
      activities: this.#readActivities(),
      invoices: this.#readInvoices(),
    };
  }

  close(): void {
    this.#database.close();
  }

  #readFees(): LegacyFee[] {
    return this.#all(
      "SELECT Id, ShortNote, Description, Amount FROM FeeList ORDER BY Id",
    ).map((row) => ({
      id: integer(row["Id"]),
      shortNote: text(row["ShortNote"]),
      description: text(row["Description"]),
      amount: amount(row["Amount"]),
    }));
  }

  #readPatients(): LegacyPatient[] {
    const handlings = new Map<number, string[]>();
    for (const row of this.#all(`
      SELECT DISTINCT d.CustomerId, l.Handling
      FROM HandlingData d JOIN HandlingList l ON l.Id = d.HandlingId
      ORDER BY d.CustomerId, l.Id
    `)) {
      const customerId = integer(row["CustomerId"]);
      handlings.set(customerId, [
        ...(handlings.get(customerId) ?? []),
        text(row["Handling"]),
      ]);
    }
    return this.#all(
      `
      SELECT Id, AgencyId, Acceptance, DayOfBirth, Geburtstag, Geburtsmonat,
        Geburtsjahr, Title, AcademicTitle, Forename, Surname, Street,
        StreetNumber, PostalCode, City, Country, CallNumber, MobilePhone, Email,
        Occupation, FamilyStatus, Citizenship, Memorandum, PartnerFrom, ChildFrom
      FROM CustomerList ORDER BY Id
    `,
    ).map((row) => {
      const id = integer(row["Id"]);
      return {
        id,
        agencyId: optionalInteger(row["AgencyId"]),
        acceptance: optionalInteger(row["Acceptance"]),
        dayOfBirth: text(row["DayOfBirth"]),
        geburtstag: text(row["Geburtstag"]),
        geburtsmonat: text(row["Geburtsmonat"]),
        geburtsjahr: text(row["Geburtsjahr"]),
        title: text(row["Title"]),
        academicTitle: text(row["AcademicTitle"]),
        forename: text(row["Forename"]),
        surname: text(row["Surname"]),
        street: text(row["Street"]),
        streetNumber: text(row["StreetNumber"]),
        postalCode: text(row["PostalCode"]),
        city: text(row["City"]),
        country: text(row["Country"]),
        callNumber: text(row["CallNumber"]),
        mobilePhone: text(row["MobilePhone"]),
        email: text(row["Email"]),
        occupation: text(row["Occupation"]),
        familyStatus: text(row["FamilyStatus"]),
        citizenship: text(row["Citizenship"]),
        memorandum: text(row["Memorandum"]),
        partnerFrom: reference(row["PartnerFrom"]),
        childFrom: reference(row["ChildFrom"]),
        handlings: handlings.get(id) ?? [],
      };
    });
  }

  #readActivities(): LegacyActivity[] {
    return this.#all(
      `
      SELECT Id, AgencyId, CustomerId, InvoiceId, Date, ShortNote, Description,
        Quantity, Amount
      FROM ActivityList ORDER BY Id
    `,
    ).map((row) => ({
      id: integer(row["Id"]),
      agencyId: optionalInteger(row["AgencyId"]),
      customerId: integer(row["CustomerId"]),
      invoiceId: optionalInteger(row["InvoiceId"]) ?? 0,
      date: text(row["Date"]),
      shortNote: text(row["ShortNote"]),
      description: text(row["Description"]),
      quantity: optionalInteger(row["Quantity"]) ?? 0,
      amount: amount(row["Amount"]),
    }));
  }

  #readInvoices(): LegacyInvoice[] {
    return this.#all(
      `
      SELECT Id, AgencyId, CustomerId, Date, InvoiceNumber, Cleared, CreditNote,
        Comment, InvoiceNote
      FROM InvoiceList ORDER BY Id
    `,
    ).map((row) => ({
      id: integer(row["Id"]),
      agencyId: optionalInteger(row["AgencyId"]),
      customerId: integer(row["CustomerId"]),
      date: text(row["Date"]),
      invoiceNumber: text(row["InvoiceNumber"]),
      cleared: optionalInteger(row["Cleared"]) ?? 0,
      creditNote: optionalInteger(row["CreditNote"]),
      comment: text(row["Comment"]),
      invoiceNote: text(row["InvoiceNote"]),
    }));
  }

  #all(sql: string): Row[] {
    return this.#database.prepare(sql).all();
  }
}

function text(value: Value): string {
  return value === null || value === undefined ? "" : String(value);
}

function integer(value: Value): number {
  return optionalInteger(value) ?? 0;
}

function optionalInteger(value: Value): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const number = Number(value);
  return Number.isInteger(number) ? number : null;
}

function amount(value: Value): LegacyAmount {
  if (value === null || value === undefined) {
    return null;
  }
  return typeof value === "number" || typeof value === "bigint"
    ? Number(value)
    : String(value);
}

// The number of a patient or a name as text.
function reference(value: Value): number | string {
  return typeof value === "number" || typeof value === "bigint"
    ? Number(value)
    : text(value);
}
