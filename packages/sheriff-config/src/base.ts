// Copyright (c) 2026 Falko Schumann. MIT license.

import {
  noDependencies,
  sameTag,
  type SheriffConfig,
} from "@softarc/sheriff-core";

export const base: SheriffConfig = {
  ignoreFileExtensions: (defaults) => [...defaults, "html"],
  autoTagging: false,
  enableBarrelLess: true,
  barrelFileName: "mod.ts",
  modules: {
    "src/ui/<element>": ["ui:<element>"],
    "src/<layer>": ["layer:<layer>"],
    src: ["layer:entry"],
  },
  depRules: {
    "layer:entry": ["layer:*"],
    "layer:application": ["layer:infrastructure"],
    "layer:ui": ["layer:application", "ui:*"],
    "layer:shared": noDependencies,
    "layer:*": [sameTag, "layer:domain", "layer:shared"],
    "ui:pages": "ui:layouts",
    "ui:*": [
      sameTag,
      "ui:assets",
      "ui:components",
      "layer:application",
      "layer:domain",
      "layer:shared",
    ],
  },
};
