// Copyright (c) 2026 Falko Schumann. MIT license.

// Vite imports a file with the suffix ?raw as string.
declare module "*?raw" {
  const content: string;
  export default content;
}
