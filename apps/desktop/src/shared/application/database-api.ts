// Copyright (c) 2026 Falko Schumann. MIT license.

export type DatabaseStatus = Readonly<{
  // The open database, none until the user has chosen one.
  filename?: string;
  // Why the last attempt to create or open a database failed.
  errorMessage?: string;
  // The last opened database, if it could not be opened on start. The user may
  // try again, for example after connecting a network drive.
  retryFilename?: string;
}>;

// Chooses the database with the event store. The main process shows the file
// dialogs of the system.
export interface DatabaseApi {
  getStatus(): Promise<DatabaseStatus>;

  createDatabase(): Promise<DatabaseStatus>;

  openDatabase(): Promise<DatabaseStatus>;

  reopenDatabase(): Promise<DatabaseStatus>;
}
