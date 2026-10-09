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
};

contextBridge.exposeInMainWorld("naturheilpraxis", api);
