// Copyright (c) 2026 Falko Schumann. MIT license.

import {
  noDependencies,
  sameTag,
  type SheriffConfig,
} from "@softarc/sheriff-core";

export const components: SheriffConfig = {
  autoTagging: false,
  enableBarrelLess: true,
  barrelFileName: "mod.ts",
  modules: {
    "src/<component>/ui/<element>": ["component:<component>", "ui:<element>"],
    "src/<component>/ui": ["component:<component>", "layer:ui"],
    "src/<component>/<layer>": ["component:<component>", "layer:<layer>"],
    "src/<component>": ["component:<component>", "layer:entry"],
  },
  depRules: {
    "component:*": [sameTag, "component:shared"],
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
