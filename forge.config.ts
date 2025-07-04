import type { ForgeConfig } from "@electron-forge/shared-types";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerDMG } from "@electron-forge/maker-dmg";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { VitePlugin } from "@electron-forge/plugin-vite";

const osxPackager =
  process.env.SIGN === "true"
    ? {
        osxNotarize: {
          tool: "notarytool",
          appleId: process.env.APPLE_ID,
          appleIdPassword: process.env.APPLE_PASSWORD,
          teamId: process.env.APPLE_TEAM_ID,
        },
        osxSign: {},
      }
    : {};

const config: ForgeConfig = {
  packagerConfig: {
    ...osxPackager,
    asar: true,
    icon: "app-icon/app-icon",
    ignore: [
      ".idea",
      ".vscode",
      "app-icon",
      "doc",
      "resources",
      "src",
      ".editorconfig",
      ".env.local",
      ".eslintrc.json",
      ".gitattributes",
      ".gitignore",
      ".prettierrc",
      "CONTRIBUTING.md",
      "forge.config.ts",
      "forge.env.d.ts",
      "LICENSE.txt",
      "Makefile",
      "README.md",
      "tsconfig.json",
      "vite.main.config.ts",
      "vite.preload.config.ts",
      "vite.renderer.config.ts",
    ],
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({ setupIcon: "app-icon/app-icon.ico" }),
    new MakerZIP({}),
    new MakerDMG({ icon: "app-icon/app-icon.icns" }),
    new MakerDeb({ options: { icon: "app-icon/app-icon.png" } }),
    new MakerRpm({}),
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {},
    },
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: "src/main.ts",
          config: "vite.main.config.ts",
          target: "main",
        },
        {
          entry: "src/preload.ts",
          config: "vite.preload.config.ts",
          target: "preload",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.ts",
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
