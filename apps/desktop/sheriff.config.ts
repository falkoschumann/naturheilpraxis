// Copyright (c) 2026 Falko Schumann. MIT license.

import { type SheriffConfig } from "@softarc/sheriff-core";

import { components } from "@naturheilpraxis/sheriff-config/components";

export const config: SheriffConfig = {
  ...components,
  entryPoints: {
    main: "src/main/main.ts",
    preload: "src/preload/preload.ts",
    renderer: "src/renderer/main.tsx",
  },
};
