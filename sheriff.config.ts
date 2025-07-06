// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { sameTag, SheriffConfig } from "@softarc/sheriff-core";

/**
 * Minimal configuration for Sheriff
 * Assigns the 'noTag' tag to all modules and
 * allows all modules to depend on each other.
 */

export const config: SheriffConfig = {
  enableBarrelLess: true,
  modules: {
    // apply tags to your modules
    src: {
      main: {
        "<type>": "layer:<type>",
      },
      preload: {
        "<type>": "layer:<type>",
      },
      renderer: {
        "<type>": "layer:<type>",
      },
    },
  },
  depRules: {
    // root is a virtual module, which contains all files not being part
    // of any module, e.g. application shell, main.ts, etc.
    //root: "noTag",
    root: "layer:*",
    noTag: "noTag",

    // add your dependency rules here
    "layer:ui": ["layer:application", "layer:domain", "layer:common"],
    "layer:application": [
      "layer:domain",
      "layer:infrastructure",
      "layer:common",
    ],
    "layer:domain": ["layer:common"],
    "layer:infrastructure": ["layer:domain", "layer:common"],
    "layer:common": sameTag,
  },
};
