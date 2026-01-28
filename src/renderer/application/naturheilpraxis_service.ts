// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useCallback, useEffect, useReducer, useState } from "react";

import { Patient } from "../../shared/domain/patient";
import { NimmPatientAufCommand } from "../../shared/domain/nimm_patient_auf_command";
import { SuchePatientQuery } from "../../shared/domain/suche_patient_query";
import {
  SuchePatientenQuery,
  SuchePatientenQueryResult,
} from "../../shared/domain/suche_patienten_query";
import {
  abgebrochen,
  feldAktualisiert,
  FormularZustand,
  initialisiereFormular,
  initialState,
  patientGefunden,
  reducer,
  sendeFormular,
  verarbeitungAbgeschlossen,
} from "../domain/patientenkarteikarte";
import { MessageGateway } from "../integration/message_gateway";

// TODO extract slices
// TODO move UI logic to UI layer

export function usePatientenkarteikarte({ nummer }: { nummer?: number }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleFeldAktualisiert = useCallback(
    (feld: keyof Patient, wert?: unknown) =>
      dispatch(feldAktualisiert({ feld, wert })),
    [],
  );

  const handleSendeFormular = useCallback(async () => {
    const formularZustand = state.formularZustand;
    dispatch(sendeFormular());
    if (formularZustand === FormularZustand.AUFNEHMEN) {
      // Cast patient from state to Patient is safe here because the form can only be sent
      // when all required fields are filled.
      const command = NimmPatientAufCommand.create(state.patient as Patient);
      const gateway = MessageGateway.create();
      const status = await gateway.nimmPatientAuf(command);
      if (status.isSuccess) {
        dispatch(verarbeitungAbgeschlossen({ nummer: status.result!.nummer }));
      }
    } else if (formularZustand === FormularZustand.BEARBEITEN) {
      dispatch(verarbeitungAbgeschlossen({}));
    }
  }, [state.formularZustand, state.patient]);

  const handleAbbrechen = useCallback(() => {
    dispatch(abgebrochen());
  }, []);

  useEffect(() => {
    (async function () {
      const gateway = MessageGateway.create();
      const settings = await gateway.loadSettings();
      dispatch(initialisiereFormular({ settings }));
    })();
  }, []);

  useEffect(() => {
    async function findPatient() {
      if (nummer == null) {
        return;
      }

      const query = SuchePatientQuery.create({ nummer });
      const gateway = MessageGateway.create();
      const result = await gateway.suchePatienten(query);
      void dispatch(patientGefunden({ patient: result.patienten[0] }));
    }

    void findPatient();
  }, [nummer]);

  return {
    state,
    dispatch,
    handleFeldAktualisiert,
    handleSendeFormular,
    handleAbbrechen,
  };
}

export function usePatientenkartei(query: SuchePatientenQuery) {
  const [results, setResults] = useState(SuchePatientenQueryResult.create());

  useEffect(() => {
    (async function () {
      const gateway = MessageGateway.create();
      const result = await gateway.suchePatienten(query);
      setResults(result);
    })();
  }, [query]);

  return results;
}
