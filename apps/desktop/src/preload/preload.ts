// Copyright (c) 2026 Falko Schumann. MIT license.

// The bridge between main process and renderer. It sends each command and query
// on the channel named after its type.

import { contextBridge, ipcRenderer } from "electron";

import type { NaturheilpraxisApi } from "../shared/application/naturheilpraxis-api.ts";

const api: NaturheilpraxisApi = {
  praxisAnlegen: (command) => ipcRenderer.invoke(command.type, command),
  praxisdatenAendern: (command) => ipcRenderer.invoke(command.type, command),
  praxenErmitteln: (query) => ipcRenderer.invoke(query.type, query),
  praxisErmitteln: (query) => ipcRenderer.invoke(query.type, query),
  gebuehrAnlegen: (command) => ipcRenderer.invoke(command.type, command),
  gebuehrAendern: (command) => ipcRenderer.invoke(command.type, command),
  gebuehrEntfernen: (command) => ipcRenderer.invoke(command.type, command),
  gebuehrenErmitteln: (query) => ipcRenderer.invoke(query.type, query),
  patientAufnehmen: (command) => ipcRenderer.invoke(command.type, command),
  patientendatenAendern: (command) => ipcRenderer.invoke(command.type, command),
  patientenErmitteln: (query) => ipcRenderer.invoke(query.type, query),
  patientErmitteln: (query) => ipcRenderer.invoke(query.type, query),
  diagnoseStellen: (command) => ipcRenderer.invoke(command.type, command),
  diagnoseAendern: (command) => ipcRenderer.invoke(command.type, command),
  diagnoseLoeschen: (command) => ipcRenderer.invoke(command.type, command),
  behandlungenErmitteln: (query) => ipcRenderer.invoke(query.type, query),
  diagnosenErmitteln: (query) => ipcRenderer.invoke(query.type, query),
  leistungErbringen: (command) => ipcRenderer.invoke(command.type, command),
  leistungAendern: (command) => ipcRenderer.invoke(command.type, command),
  leistungLoeschen: (command) => ipcRenderer.invoke(command.type, command),
  rechnungErstellen: (command) => ipcRenderer.invoke(command.type, command),
  rechnungAendern: (command) => ipcRenderer.invoke(command.type, command),
  entwurfLoeschen: (command) => ipcRenderer.invoke(command.type, command),
  nichtAbgerechneteLeistungenErmitteln: (query) =>
    ipcRenderer.invoke(query.type, query),
  rechnungenErmitteln: (query) => ipcRenderer.invoke(query.type, query),
  rechnungErmitteln: (query) => ipcRenderer.invoke(query.type, query),
  rechnungVersenden: (command) => ipcRenderer.invoke(command.type, command),
  rechnungZurueckstufen: (command) => ipcRenderer.invoke(command.type, command),
  zahlungErfassen: (command) => ipcRenderer.invoke(command.type, command),
};

contextBridge.exposeInMainWorld("naturheilpraxis", api);
