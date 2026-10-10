// Copyright (c) 2026 Falko Schumann. MIT license.

import { DatabaseSync } from "node:sqlite";

import { describe, expect, it } from "vitest";

import { LegacyDatabase } from "./legacy-database.ts";

describe("Legacy Database", () => {
  it("sollte Gebühren mit Betrag als Zahl oder Text lesen", () => {
    const database = legacyDatabase(`
      INSERT INTO FeeList (Id, ShortNote, Description, Amount, AmountDM) VALUES
        (2, ' 1', 'Untersuchung', '20,50', 40), (1, '3', NULL, 4.5, 9), (3, 'Sonder', 'Labor', NULL, NULL);
    `);

    const data = LegacyDatabase.fromDatabase(database).read();

    expect(data.fees).toEqual([
      { id: 1, shortNote: "3", description: "", amount: 4.5 },
      { id: 2, shortNote: " 1", description: "Untersuchung", amount: "20,50" },
      { id: 3, shortNote: "Sonder", description: "Labor", amount: null },
    ]);
  });

  it("sollte Patienten mit ihren Schlüsselworten lesen", () => {
    const database = legacyDatabase(`
      INSERT INTO CustomerList (Id, AgencyId, Acceptance, DayOfBirth, Title, Forename, Surname, PartnerFrom, ChildFrom)
        VALUES (1, 5, 2002, '1973-05-27', 'Frau', 'Erika', 'Mustermann', 2, NULL),
               (2, NULL, NULL, NULL, NULL, 'Max', 'Mustermann', 'Erika Mustermann', 'Eltern');
      INSERT INTO HandlingList (Id, Handling, Standard) VALUES (1, 'Aktiv', 1), (5, 'Weihnachtskarte', 1);
      INSERT INTO HandlingData (CustomerId, HandlingId) VALUES (1, 5), (1, 1), (1, 1);
    `);

    const data = LegacyDatabase.fromDatabase(database).read();

    expect(data.patients).toEqual([
      expect.objectContaining({
        id: 1,
        agencyId: 5,
        acceptance: 2002,
        dayOfBirth: "1973-05-27",
        title: "Frau",
        forename: "Erika",
        surname: "Mustermann",
        partnerFrom: 2,
        childFrom: "",
        handlings: ["Aktiv", "Weihnachtskarte"],
      }),
      expect.objectContaining({
        id: 2,
        agencyId: null,
        acceptance: null,
        dayOfBirth: "",
        title: "",
        partnerFrom: "Erika Mustermann",
        childFrom: "Eltern",
        handlings: [],
      }),
    ]);
  });

  it("sollte Leistungen und Rechnungen lesen", () => {
    const database = legacyDatabase(`
      INSERT INTO ActivityList (Id, AgencyId, CustomerId, InvoiceId, Date, ShortNote, Description, Quantity, Amount)
        VALUES (7, 5, 1, 3, '2022-11-24', '20.1', 'Massage', 2, '10,50'),
               (8, 1, 1, -1, NULL, NULL, NULL, 1, 20);
      INSERT INTO InvoiceList (Id, AgencyId, CustomerId, Date, InvoiceNumber, Cleared, CreditNote, Comment, InvoiceNote)
        VALUES (3, 5, 1, '2022-11-25', '1/221125', 0, 0, ' Lumbago', 'Bitte&#160;zahlen'),
               (4, 0, 1, NULL, '1/', 0, NULL, NULL, NULL);
    `);

    const data = LegacyDatabase.fromDatabase(database).read();

    expect(data.activities).toEqual([
      {
        id: 7,
        agencyId: 5,
        customerId: 1,
        invoiceId: 3,
        date: "2022-11-24",
        shortNote: "20.1",
        description: "Massage",
        quantity: 2,
        amount: "10,50",
      },
      {
        id: 8,
        agencyId: 1,
        customerId: 1,
        invoiceId: -1,
        date: "",
        shortNote: "",
        description: "",
        quantity: 1,
        amount: 20,
      },
    ]);
    expect(data.invoices).toEqual([
      {
        id: 3,
        agencyId: 5,
        customerId: 1,
        date: "2022-11-25",
        invoiceNumber: "1/221125",
        cleared: 0,
        creditNote: 0,
        comment: " Lumbago",
        invoiceNote: "Bitte&#160;zahlen",
      },
      {
        id: 4,
        agencyId: 0,
        customerId: 1,
        date: "",
        invoiceNumber: "1/",
        cleared: 0,
        creditNote: null,
        comment: "",
        invoiceNote: "",
      },
    ]);
  });
});

// The tables of the legacy database with the columns the migration reads.
function legacyDatabase(rows: string): DatabaseSync {
  const database = new DatabaseSync(":memory:");
  database.exec(`
    CREATE TABLE FeeList (Id INTEGER PRIMARY KEY, ShortNote TEXT, Description TEXT, AmountDM NUMERIC, Amount NUMERIC);
    CREATE TABLE CustomerList (
      Id INTEGER PRIMARY KEY, AgencyId NUMERIC, Acceptance NUMERIC, DayOfBirth TEXT,
      Geburtstag NUMERIC, Geburtsmonat NUMERIC, Geburtsjahr NUMERIC,
      Title TEXT, AcademicTitle TEXT, Forename TEXT, Surname TEXT,
      Street TEXT, StreetNumber TEXT, PostalCode TEXT, City TEXT, Country TEXT,
      CallNumber TEXT, MobilePhone TEXT, Email TEXT,
      Occupation TEXT, FamilyStatus TEXT, Citizenship TEXT, Memorandum TEXT,
      PartnerFrom NUMERIC, ChildFrom NUMERIC
    );
    CREATE TABLE HandlingList (Standard NUMERIC, Handling TEXT, Id INTEGER PRIMARY KEY);
    CREATE TABLE HandlingData (Created TEXT, CustomerId NUMERIC, HandlingId NUMERIC);
    CREATE TABLE ActivityList (
      Id INTEGER PRIMARY KEY, AgencyId NUMERIC, CustomerId NUMERIC, InvoiceId NUMERIC, Date TEXT,
      ShortNote TEXT, Description TEXT, Quantity NUMERIC, Amount NUMERIC
    );
    CREATE TABLE InvoiceList (
      Id INTEGER PRIMARY KEY, AgencyId NUMERIC, CustomerId NUMERIC, Date TEXT, InvoiceNumber TEXT,
      Cleared NUMERIC, CreditNote NUMERIC, Comment TEXT, InvoiceNote TEXT
    );
  `);
  database.exec(rows);
  return database;
}
