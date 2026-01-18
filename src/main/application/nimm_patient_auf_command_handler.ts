// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Success } from "@muspellheim/shared";

import { Query } from "../domain/event_store";
import type { CloudEventStore } from "../domain/cloud_event_store";
import {
  type NimmPatientAufCommand,
  type NimmPatientAufCommandStatus,
} from "../../shared/domain/nimm_patient_auf_command";
import { projectNextPatientennummer } from "../domain/next_patientennummer_projection";
import { PatientAufgenommenV1Event } from "../domain/patient_events";

export async function nimmPatientAuf(
  command: NimmPatientAufCommand,
  eventStore: CloudEventStore,
): Promise<NimmPatientAufCommandStatus> {
  const events = eventStore.read(Query.all());
  const nummer = await projectNextPatientennummer(events);
  const event = PatientAufgenommenV1Event.create({
    ...command,
    nummer,
    geburtsdatum: command.geburtsdatum.toString(),
  });
  await eventStore.append(event);
  return new Success({ nummer });
}
