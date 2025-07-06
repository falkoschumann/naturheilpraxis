// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

declare global {
  interface Window {
    versions: {
      node: () => string;
      chrome: () => string;
      electron: () => string;
      ping: () => Promise<string>;
    };
  }
}

export {};
