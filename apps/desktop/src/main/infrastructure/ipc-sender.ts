// Copyright (c) 2026 Falko Schumann. MIT license.

export type Sender = Readonly<{ url: string; isMainFrame: boolean }>;

// Only the main frame of the app may send messages to the main process, not an
// embedded frame and not a page the window was navigated to. The router of the
// app changes only the hash of the URL.
export function isTrustedSender(
  sender: Sender | null,
  rendererUrl: string,
): boolean {
  if (sender === null || !sender.isMainFrame) {
    return false;
  }
  return withoutHash(sender.url) === withoutHash(rendererUrl);
}

function withoutHash(url: string): string {
  const parsed = new URL(url);
  parsed.hash = "";
  return parsed.href;
}
