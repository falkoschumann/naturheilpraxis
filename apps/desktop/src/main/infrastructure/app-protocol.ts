// Copyright (c) 2026 Falko Schumann. MIT license.

import path from "node:path";

// The scheme and host the app is loaded from instead of file://, so a page of
// the app can refer only to the files of the app. The renderer refers to a
// Rechnung with rechnungUrl() of the PrintApi.
export const appScheme = "app";
export const appHost = "naturheilpraxis";

// Returns the ID of the Rechnung a URL like rechnungUrl() refers to, undefined
// for any other URL.
export function resolveRechnungId(url: string): string | undefined {
  const parsed = new URL(url);
  if (parsed.protocol !== `${appScheme}:` || parsed.host !== appHost) {
    return undefined;
  }

  const match = /^\/rechnungen\/([0-9a-f-]+)\.html$/i.exec(parsed.pathname);
  return match?.[1];
}

// Maps a URL of the app to a file below the root, undefined for any other URL.
// The parser of the URL already resolves dot segments, but not encoded path
// separators.
export function resolveAppFile(url: string, root: string): string | undefined {
  const parsed = new URL(url);
  if (parsed.protocol !== `${appScheme}:` || parsed.host !== appHost) {
    return undefined;
  }

  const segments = parsed.pathname
    .split("/")
    .filter((segment) => segment !== "");
  let names: string[];
  try {
    names = segments.map(decodeURIComponent);
  } catch {
    return undefined;
  }
  if (
    names.some((name) => /[/\\]/.test(name) || name === "." || name === "..")
  ) {
    return undefined;
  }

  const file = path.join(root, ...names);
  return file.startsWith(root + path.sep) ? file : undefined;
}
