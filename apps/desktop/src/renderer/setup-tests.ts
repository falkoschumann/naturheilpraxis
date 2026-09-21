// Copyright (c) 2026 Falko Schumann. MIT license.

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Testing Library unmounts after each test by itself only when the test globals
// are enabled, which they are not.
afterEach(cleanup);
