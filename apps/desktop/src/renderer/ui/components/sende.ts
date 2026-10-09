// Copyright (c) 2026 Falko Schumann. MIT license.

import type { CommandStatus } from "../../../shared/application/naturheilpraxis-api.ts";

// A failed message to the main process becomes a rejection with the given
// message.
export async function sende(
  command: () => Promise<CommandStatus>,
  errorMessage: string,
): Promise<CommandStatus> {
  try {
    return await command();
  } catch {
    return { success: false, errorMessage };
  }
}
