// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import * as sqlite from "node:sqlite";

export class LegacyDatabaseGateway {
  #db: sqlite.DatabaseSync;

  constructor(filename: string) {
    this.#db = new sqlite.DatabaseSync(filename);
  }

  queryAgencies() {
    // language=SQLite
    const records = this.#executeQuery<AgencyDto>(
      "SELECT agency as agency FROM agencylist ORDER BY ordernumber;",
    );
    return records.map((record) => record.agency);
  }

  queryTitles() {
    // language=SQLite
    const records = this.#executeQuery<TitleDto>(
      "SELECT title as title FROM titlelist ORDER BY title;",
    );
    return records.map((record) => record.title);
  }

  queryFamilyStatus() {
    // language=SQLite
    const records = this.#executeQuery<FamilyStatusDto>(
      "SELECT familystatus as familyStatus FROM familystatuslist ORDER BY familystatus;",
    );
    return records.map((record) => record.familyStatus);
  }

  queryHandling() {
    // language=SQLite
    const records = this.#executeQuery<HandlingDto>(`
      SELECT handling AS handling,
             standard AS standard
        FROM handlinglist
       ORDER BY handling;
    `);
    return records.map((record) => record);
  }

  queryCustomers() {
    // language=SQLite
    return this.#executeQuery<CustomerDto>(`
      SELECT customerlist.id AS id,
             surname AS surname,
             forename AS forename,
             dayofbirth AS dayOfBirth,
             acceptance AS acceptance,
             agencylist.agency AS agency,
             title AS title,
             trim(trim(street) || ' ' || trim(streetnumber)) as street,
             city AS city,
             postalcode AS postalCode,
             country AS country,
             citizenship AS citizenship,
             academictitle AS academicTitle,
             occupation AS occupation,
             callnumber AS callNumber,
             mobilephone AS mobilePhone,
             email AS email,
             familystatus AS familyStatus,
             partnerfrom AS partnerFrom,
             childfrom AS childFrom,
             memorandum AS memorandum,
             (SELECT GROUP_CONCAT(handlinglist.handling, ', ')
                FROM handlinglist
                       INNER JOIN handlingdata ON handlinglist.id=handlingdata.handlingid
               WHERE handlingdata.customerid=customerlist.id) AS handlings
        FROM customerlist
        LEFT JOIN agencylist ON customerlist.agencyid=agencylist.id
       ORDER BY customerlist.id;
    `);
  }

  queryActivities() {
    // language=SQLite
    return this.#executeQuery<ActivityDto>(`
      SELECT activitylist.id AS id,
             agencylist.agency AS agency,
             customerid AS customerId,
             date AS date,
             shortnote AS shortNote,
             description AS description,
             amount AS amount,
             quantity AS quantity,
             invoiceid AS invoiceId,
             comment AS comment
        FROM activitylist
        LEFT JOIN agencylist ON activitylist.agencyid=agencylist.id
    `);
  }

  queryInvoices() {
    // language=SQLite
    return this.#executeQuery<InvoiceDto>(`
      SELECT invoicelist.id AS id,
             agency AS agency,
             invoicenumber AS invoiceNumber,
             date AS date,
             customerId AS customerId,
             invoiceNote AS invoiceNote,
             comment AS comment,
             cleared AS cleared,
             row_number() OVER (PARTITION BY invoicenumber ORDER BY invoicelist.id) AS invoiceSequence,
             count(invoicenumber) OVER (PARTITION BY invoicenumber) AS invoiceCount
        FROM invoicelist
        LEFT JOIN agencylist ON invoicelist.agencyid=agencylist.id
    `);
  }

  queryDiagnoses() {
    // language=SQLite
    return this.#executeQuery<DiagnosisDto>(`
      SELECT MIN(date) AS date,
             customerid AS customerId,
             trim(comment, ' ' || char(10) || char(13)) AS comment
        FROM invoicelist
       WHERE trim(comment, ' ' || char(10) || char(13)) <> ''
       GROUP BY customerid, lower(trim(comment, ' ' || char(10) || char(13)));
    `);
  }

  #executeQuery<T>(sql: string): T[] {
    const statement = this.#db.prepare(sql);
    const records = statement.all();
    return records as T[];
  }
}

export interface AgencyDto {
  id: number;
  agency: string;
  orderNumber: number;
}

export interface FamilyStatusDto {
  id: number;
  familyStatus: string;
}

export interface HandlingDto {
  id: number;
  handling: string;
  standard?: number;
}

export interface TitleDto {
  id: number;
  title: string;
}

export interface CustomerDto {
  id: number;
  surname?: string;
  forename?: string;
  dayOfBirth?: string;
  acceptance?: number;
  agency?: string;
  title?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  citizenship?: string;
  academicTitle?: string;
  occupation?: string;
  callNumber?: string;
  mobilePhone?: string;
  email?: string;
  familyStatus?: string;
  partnerFrom?: string;
  childFrom?: string;
  memorandum?: string;
  handlings?: string;
}

export interface ActivityDto {
  id: number;
  agency?: string;
  customerId?: number;
  date?: string;
  shortNote?: string;
  description?: string;
  amount?: number;
  quantity?: number;
  invoiceId?: number;
  comment?: string;
}

export interface InvoiceDto {
  id: number;
  agency?: string;
  invoiceNumber?: string;
  date?: string;
  customerId?: number;
  invoiceNote?: string;
  comment?: string;
  cleared?: number;
  invoiceSequence: number;
  invoiceCount: number;
}

export interface DiagnosisDto {
  date?: string;
  customerId?: number;
  comment: string;
}
