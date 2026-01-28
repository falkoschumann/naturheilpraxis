// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useCallback, useEffect, useState } from "react";

import {
  PatientenQuery,
  PatientenQueryResult,
} from "../../shared/domain/suche_patienten_query";
import { useMessageHandler } from "./message_handler_context";

export function usePatientenQueryHandler(): [
  PatientenQueryResult,
  (query: PatientenQuery) => Promise<void>,
] {
  const [patienten, setPatienten] = useState(PatientenQueryResult.create());
  const messageHandler = useMessageHandler();

  const suchePatienten = useCallback(
    async (query: PatientenQuery) => {
      const result = await messageHandler.suchePatienten(query);
      setPatienten(result);
    },
    [messageHandler],
  );

  useEffect(
    () => (() => void suchePatienten(PatientenQuery.create()))(),
    [suchePatienten],
  );

  return [patienten, suchePatienten];
}
