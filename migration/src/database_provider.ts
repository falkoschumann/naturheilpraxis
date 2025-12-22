// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import * as sqlite from "node:sqlite";

export class DatabaseProvider {
  #db: sqlite.DatabaseSync;

  constructor(filename: string) {
    this.#db = new sqlite.DatabaseSync(filename);
  }

  queryAgencies(): string[] {
    // language=SQLite
    const records = this.executeQuery<AgencyListDto>(
      "SELECT * FROM agencylist ORDER BY ordernumber;",
    );
    return records.map((record) => record.Agency);
  }

  queryTitles(): string[] {
    // language=SQLite
    const records = this.executeQuery<TitleListDto>(
      "SELECT * FROM titlelist ORDER BY title;",
    );
    return records.map((record) => record.Title);
  }

  queryFamilyStatus(): string[] {
    // language=SQLite
    const records = this.executeQuery<FamilyStatusListDto>(
      "SELECT * FROM familystatuslist ORDER BY familystatus;",
    );
    return records.map((record) => record.FamilyStatus);
  }

  queryHandling(): string[] {
    // language=SQLite
    const records = this.executeQuery<HandlingListDto>(
      "SELECT * FROM handlinglist ORDER BY handling;",
    );
    return records.map((record) => record.Handling);
  }

  queryStandardHandling(): string[] {
    // language=SQLite
    const records = this.executeQuery<HandlingListDto>(
      "SELECT * FROM handlinglist WHERE standard=1 ORDER BY handling;",
    );
    return records.map((record) => record.Handling);
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

export interface AgencyListDto {
  ID: number;
  Agency: string;
  OrderNumber: number;
}

export interface FamilyStatusListDto {
  Id: number;
  FamilyStatus: string;
}

export interface HandlingListDto {
  Id: number;
  Handling: string;
  Standard: number;
}

export interface TitleListDto {
  Id: number;
  Title: string;
}
