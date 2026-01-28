// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { createContext, useContext } from "react";

import { MessageHandler } from "./message_handler";

export const MessageHandlerContext = createContext(MessageHandler.createNull());

export function useMessageHandler() {
  return useContext(MessageHandlerContext);
}
