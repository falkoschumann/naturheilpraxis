// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useCallback, useEffect, useState } from "react";

import {
  PatientQuery,
  PatientQueryResult,
} from "../../shared/domain/suche_patient_query";
import { useMessageHandler } from "./message_handler_context";

export function usePatient(query: Partial<PatientQuery>) {
  const [patient, setPatient] = useState(PatientQueryResult.create());
  const messageHandler = useMessageHandler();

  const suchePatient = useCallback(
    async (query: PatientQuery) => {
      const result = await messageHandler.suchePatient(query);
      setPatient(result);
    },
    [messageHandler],
  );

  useEffect(() => {
    async function runAsync() {
      if (query.nummer != null) {
        void suchePatient(PatientQuery.create({ nummer: query.nummer }));
      }
    }

    void runAsync();
  }, [query.nummer, suchePatient]);

  return [patient, suchePatient] as const;
}
