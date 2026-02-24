// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { createContext, useContext } from "react";
import type { MessageHandler } from "./message_handler";

const defaultMessageHandler: MessageHandler = {
  async nimmPatientAuf() {
    return Promise.reject("Called stubbed method.");
  },

  async suchePatient() {
    return Promise.reject("Called stubbed method.");
  },

  async suchePatienten() {
    return Promise.reject("Called stubbed method.");
  },

  async loadSettings() {
    return Promise.reject("Called stubbed method.");
  },

  async storeSettings() {
    return Promise.reject("Called stubbed method.");
  },
};

export const MessageHandlerContext = createContext<MessageHandler>(
  defaultMessageHandler,
);

export function useMessageHandler() {
  return useContext(MessageHandlerContext);
}
