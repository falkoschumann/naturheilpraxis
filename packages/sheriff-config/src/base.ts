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
    "src/ui/<element>": ["layer:ui", "ui:<element>"],
    "src/ui": ["layer:ui", "ui:entry"],
    "src/<layer>": ["layer:<layer>"],
    src: ["layer:entry"],
  },
  depRules: {
    "layer:entry": ["layer:*", "ui:entry"],
    "layer:application": ["layer:infrastructure"],
    "layer:domain": noDependencies,
    "layer:ui": ["layer:application", "ui:*"],
    "layer:*": [sameTag, "layer:domain", "layer:shared"],
    "ui:entry": "ui:*",
    "ui:pages": "ui:layouts",
    "ui:*": [
      sameTag,
      "ui:assets",
      "ui:components",
      "layer:domain",
      "layer:shared",
    ],
  },
};
