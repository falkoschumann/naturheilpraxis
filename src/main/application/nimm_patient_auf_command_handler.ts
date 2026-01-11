// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Success } from "@muspellheim/shared";

import {
  type NimmPatientAufCommand,
  type NimmPatientAufCommandStatus,
} from "../../shared/domain/nimm_patient_auf_command";
import { projectNextPatientennummer } from "../domain/next_patientennummer_projection";
import { PatientAufgenommenV1Event } from "../domain/patient_events";
import type { EventStore } from "../infrastructure/event_store";

export async function nimmPatientAuf(
  command: NimmPatientAufCommand,
  eventStore: EventStore,
): Promise<NimmPatientAufCommandStatus> {
  const replay = eventStore.replay();
  const nummer = await projectNextPatientennummer(replay);
  const event = PatientAufgenommenV1Event.create({
    ...command,
    nummer,
    geburtsdatum: command.geburtsdatum.toString(),
  });
  await eventStore.record(event);
  return new Success({ nummer });
}
