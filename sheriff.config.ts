// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { sameTag, SheriffConfig } from "@softarc/sheriff-core";

export const config: SheriffConfig = {
  enableBarrelLess: true,
  modules: {
    "src/main/application": ["layer:application", "component:main"],
    "src/main/common": ["layer:common", "component:main"],
    "src/main/domain": ["layer:domain", "component:main"],
    "src/main/infrastructure": ["layer:infrastructure", "component:main"],

    "src/preload/application": ["layer:application", "component:preload"],
    "src/preload/common": ["layer:common", "component:preload"],
    "src/preload/domain": ["layer:domain", "component:preload"],
    "src/preload/infrastructure": ["layer:infrastructure", "component:preload"],

    "src/renderer/application": ["layer:application", "component:renderer"],
    "src/renderer/common": ["layer:common", "component:renderer"],
    "src/renderer/domain": ["layer:domain", "component:renderer"],
    "src/renderer/infrastructure": [
      "layer:infrastructure",
      "component:renderer",
    ],
  },
  depRules: {
    // root is a virtual module, which contains all files not being part
    // of any module, e.g. application shell, main.ts, etc.
    root: "layer:*",
    noTag: "noTag",

    // add your dependency rules here
    "layer:ui": ["layer:application", "layer:domain"],
    "layer:application": ["layer:domain", "layer:infrastructure"],
    "layer:infrastructure": ["layer:domain"],
    "layer:*": ["layer:common"],
    "component:*": sameTag,
  },
};
