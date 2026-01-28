// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "bootstrap";

import { MessageHandler } from "./application/message_handler";
import { MessageHandlerContext } from "./application/message_handler_context";
import "./ui/assets/style.scss";
import App from "./ui/app";

// TODO build, bind, run in program or main: index.tsx at root level
//   using state and onXxx to not calling handlers directly from UI layer
// TODO hold settings in property and use updateSettings method

const messageHandler = MessageHandler.create();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <MessageHandlerContext value={messageHandler}>
        <App />
      </MessageHandlerContext>
    </BrowserRouter>
  </StrictMode>,
);
