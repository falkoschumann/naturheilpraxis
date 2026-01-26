// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Success } from "@muspellheim/shared";

import type { EventStore } from "../infrastructure/event_store";
import { Query } from "../infrastructure/event_store";
import {
  type NimmPatientAufCommand,
  type NimmPatientAufCommandStatus,
} from "../../shared/domain/nimm_patient_auf_command";
import { projectNextPatientennummer } from "../domain/next_patientennummer_projection";
import { PatientAufgenommenV1Event } from "../domain/patient_events";

export type NimmPatientAufCommandHandlerOptions = {
  eventStore: EventStore;
};

export async function nimmPatientAuf(
  command: NimmPatientAufCommand,
  { eventStore }: NimmPatientAufCommandHandlerOptions,
): Promise<NimmPatientAufCommandStatus> {
  const events = eventStore.replay<PatientAufgenommenV1Event>(
    Query.fromItems([{ types: [PatientAufgenommenV1Event.TYPE] }]),
  );
  const nummer = await projectNextPatientennummer(events);
  const event = PatientAufgenommenV1Event.create({
    ...command,
    nummer,
    geburtsdatum: command.geburtsdatum.toString(),
  });
  await eventStore.record(event);
  return new Success({ nummer });
}
