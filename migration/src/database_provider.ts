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
      SELECT customerlist.id AS id,
             surname AS surname,
             forename AS forename,
             dayofbirth AS dayOfBirth,
             acceptance AS acceptance,
             agencylist.agency AS agency,
             title AS title,
             trim(street || ' ' || streetnumber) as street,
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
