// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "../shared/polyfill";
import { MessageHandlerContext } from "./ui/components/message_handler_context";
import { messageHandler } from "./message_handler";
import App from "./ui";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MessageHandlerContext value={messageHandler}>
      <App />
    </MessageHandlerContext>
  </StrictMode>,
);
