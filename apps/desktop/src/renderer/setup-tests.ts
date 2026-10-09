// Copyright (c) 2026 Falko Schumann. MIT license.

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Testing Library unmounts after each test by itself only when the test globals
// are enabled, which they are not.
afterEach(cleanup);

// jsdom does not implement modal dialogs. Opening and closing is enough for the
// tests; the focus handling is left to the browser.
HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
  this.open = true;
};
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
  this.open = false;
};
