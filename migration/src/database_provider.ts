// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import * as sqlite from "node:sqlite";

export class DatabaseProvider {
  #db: sqlite.DatabaseSync;

  constructor(filename: string) {
    this.#db = new sqlite.DatabaseSync(filename);
  }

  queryAgencies(): string[] {
    // language=SQLite
    const records = this.executeQuery<AgencyDto>(
      "SELECT agency as agency FROM agencylist ORDER BY ordernumber;",
    );
    return records.map((record) => record.agency);
  }

  queryTitles(): string[] {
    // language=SQLite
    const records = this.executeQuery<TitleDto>(
      "SELECT title as title FROM titlelist ORDER BY title;",
    );
    return records.map((record) => record.title);
  }

  queryFamilyStatus(): string[] {
    // language=SQLite
    const records = this.executeQuery<FamilyStatusDto>(
      "SELECT familystatus as familyStatus FROM familystatuslist ORDER BY familystatus;",
    );
    return records.map((record) => record.familyStatus);
  }

  queryHandling(): string[] {
    // language=SQLite
    const records = this.executeQuery<HandlingDto>(
      "SELECT handling as handling FROM handlinglist ORDER BY handling;",
    );
    return records.map((record) => record.handling);
  }

  queryStandardHandling(): string[] {
    // language=SQLite
    const records = this.executeQuery<HandlingDto>(
      "SELECT handling as handling FROM handlinglist WHERE standard=1 ORDER BY handling;",
    );
    return records.map((record) => record.handling);
  }

  queryCustomers(): CustomerDto[] {
    // language=SQLite
    return this.executeQuery<CustomerDto>(`
      SELECT customerlist.id,
             acceptance,
             agencylist.agency,
             title,
             surname,
             forename,
             street || ' ' || streetnumber as street,
             city,
             postalcode,
             country,
             callnumber,
             mobilephone,
             email,
             memorandum,
             academictitle,
             dayofbirth,
             occupation,
             familystatus,
             citizenship,
             partnerfrom,
             childfrom,
             (SELECT GROUP_CONCAT(handlinglist.handling, ', ')
                FROM handlinglist
                       INNER JOIN handlingdata ON handlinglist.id=handlingdata.handlingid
               WHERE handlingdata.customerid=customerlist.id) AS Handlings
        FROM customerlist
               INNER JOIN agencylist ON customerlist.agencyid=agencylist.id;
    `);
  }

  executeQuery<T>(sql: string): T[] {
    const statement = this.#db.prepare(sql);
    const records = statement.all();
    return records as T[];
  }

  close() {
    this.#db.close();
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
  acceptance?: number;
  agency?: string;
  title?: string;
  familyStatus?: string;
  surname?: string;
  forename?: string;
  street?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  callNumber?: string;
  mobilePhone?: string;
  email?: string;
  memorandum?: string;
  academicTitle?: string;
  dayOfBirth: string;
  occupation?: string;
  citizenship?: string;
  partnerFrom?: string;
  childFrom?: string;
  handlings?: string;
}
