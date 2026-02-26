// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { createContext, useContext } from "react";

import type { MessageHandler } from "./message_handler";

export const MessageHandlerContext = createContext<MessageHandler | null>(null);

export function useMessageHandler() {
  const messageHandler = useContext(MessageHandlerContext);
  if (messageHandler == null) {
    throw new Error("Context has not a MessageHandler.");
  }

  return messageHandler;
}
