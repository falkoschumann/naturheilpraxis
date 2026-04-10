// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useCallback, useState } from "react";
import { useParams } from "react-router";

import {
  PatientQuery,
  PatientQueryResult,
} from "../../../../shared/domain/patient_query";
import { useMessageHandler } from "../../components/message_handler_context";
import type { NimmPatientAufCommand } from "../../../../shared/domain/nimm_patient_auf_command";

export function usePatient() {
  const { nummer } = useParams();
  const messageHandler = useMessageHandler();
  const [result, setResult] = useState(PatientQueryResult.create());

  const suchePatient = useCallback(
    async (query: PatientQuery) => {
      const result = await messageHandler.suchePatient(query);
      setResult(result);
    },
    [messageHandler],
  );

  // FIXME can trigger setResult() of suchePatient() before component is mounted
  //   Browser error:
  //     Can't perform a React state update on a component that hasn't mounted
  //     yet. This indicates that you have a side-effect in your render function
  //     that asynchronously tries to update the component. Move this work to
  //     useEffect instead.
  const [prevNummer, setPrevNummer] = useState<string>();
  if (nummer !== prevNummer) {
    setPrevNummer(nummer);
    void suchePatient(PatientQuery.create({ nummer: Number(nummer) }));
  }

  const nimmPatientAuf = useCallback(
    async (command: NimmPatientAufCommand) => {
      const status = await messageHandler.nimmPatientAuf(command);
      if (status.isSuccess) {
        await suchePatient(
          PatientQuery.create({ nummer: status.result!.nummer }),
        );
      }
      return status;
    },
    [messageHandler, suchePatient],
  );

  return [result, nimmPatientAuf] as const;
}
