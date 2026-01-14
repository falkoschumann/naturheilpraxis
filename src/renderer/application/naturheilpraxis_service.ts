// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useCallback, useEffect, useReducer, useState } from "react";
import { Patient } from "../../shared/domain/patient";
import { NimmPatientAufCommand } from "../../shared/domain/nimm_patient_auf_command";
import {
  NimmPatientAufCommandDto,
  NimmPatientAufCommandStatusDto,
} from "../../shared/infrastructure/nimm_patient_auf_command_dto";
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
import { EinstellungenDto } from "../../shared/infrastructure/einstellungen";
import {
  SuchePatientenQueryDto,
  SuchePatientenQueryResultDto,
} from "../../shared/infrastructure/suche_patienten_query_dto";

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
      const status = await nimmPatientAuf(command);
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
      const einstellungenDto = await window.naturheilpraxis.ladeEinstellungen();
      const einstellungen =
        EinstellungenDto.create(einstellungenDto).validate();
      dispatch(initialisiereFormular({ einstellungen }));
    })();
  }, []);

  useEffect(() => {
    async function findPatient() {
      if (nummer == null) {
        return;
      }

      const query = SuchePatientQuery.create({ nummer });
      const result = await queryPatientenkartei(query);
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

async function nimmPatientAuf(command: NimmPatientAufCommand) {
  const statusDto = await window.naturheilpraxis.nimmPatientAuf(
    NimmPatientAufCommandDto.fromModel(command),
  );
  return NimmPatientAufCommandStatusDto.create(statusDto).validate();
}

export function usePatientenkartei(query: SuchePatientenQuery) {
  const [results, setResults] = useState(SuchePatientenQueryResult.create());

  useEffect(() => {
    (async function () {
      const result = await queryPatientenkartei(query);
      setResults(result);
    })();
  });

  return results;
}

async function queryPatientenkartei(query: SuchePatientenQuery) {
  console.log("queryPatientenkartei:", query);
  const resultDto = await window.naturheilpraxis.suchePatienten(
    SuchePatientenQueryDto.fromModel(query),
  );
  return SuchePatientenQueryResultDto.create(resultDto).validate();
}
