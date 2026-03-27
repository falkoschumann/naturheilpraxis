// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useCallback, useState } from "react";
import { useLocation } from "react-router";

import {
  PatientQuery,
  PatientQueryResult,
} from "../../../../shared/domain/suche_patient_query";
import { useMessageHandler } from "../../components/message_handler_context";
import type { NimmPatientAufCommand } from "../../../../shared/domain/nimm_patient_auf_command";

export function usePatient() {
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const nummer = search.has("nummer")
    ? Number(search.get("nummer"))
    : undefined;
  const messageHandler = useMessageHandler();
  const [result, setResult] = useState(PatientQueryResult.create());

  const suchePatient = useCallback(
    async (query: PatientQuery) => {
      const result = await messageHandler.suchePatient(query);
      setResult(result);
    },
    [messageHandler],
  );

  const [prevNummer, setPrevNummer] = useState<number>();
  if (nummer !== prevNummer) {
    setPrevNummer(nummer);
    void suchePatient(PatientQuery.create({ nummer }));
  }

  const nimmPatientAuf = useCallback(
    async (command: NimmPatientAufCommand) => {
      const status = await messageHandler.nimmPatientAuf(command);
      if (status.isSuccess) {
        const result = await messageHandler.suchePatient(
          PatientQuery.create({ nummer: status.result!.nummer }),
        );
        setResult(result);
      }
      return status;
    },
    [messageHandler],
  );

  return [result, nimmPatientAuf] as const;
}
