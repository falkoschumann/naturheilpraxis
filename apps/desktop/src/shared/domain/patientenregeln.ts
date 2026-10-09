// Copyright (c) 2026 Falko Schumann. MIT license.

import type { Rejection } from "./result.ts";
import type { Patientennummer } from "./value-objects.ts";

// The invariants several consistency boundaries share.

export function praxisExistiert(
  praxiskuerzel: string,
  praxisAngelegt: boolean,
): Rejection | undefined {
  if (praxisAngelegt) {
    return undefined;
  }
  return {
    invariant: "praxis-existiert",
    message: `Die Praxis „${praxiskuerzel}“ ist nicht angelegt. Bitte wählen Sie eine angelegte Praxis.`,
  };
}

export function angehoerigeExistieren(
  angehoerige: Readonly<{
    partnerVon?: Patientennummer;
    kindVon?: Patientennummer;
  }>,
  aufgenommen: ReadonlySet<Patientennummer>,
): Rejection | undefined {
  for (const [rolle, nummer] of [
    ["Partner von", angehoerige.partnerVon],
    ["Kind von", angehoerige.kindVon],
  ] as const) {
    if (nummer !== undefined && !aufgenommen.has(nummer)) {
      return {
        invariant: "angehoerige-existieren",
        message: `Der unter „${rolle}“ angegebene Patient mit der Nummer ${nummer} ist nicht aufgenommen. Bitte wählen Sie einen aufgenommenen Patienten.`,
      };
    }
  }
  return undefined;
}

export function patientExistiert(
  patientennummer: Patientennummer,
  patientAufgenommen: boolean,
): Rejection | undefined {
  if (patientAufgenommen) {
    return undefined;
  }
  return {
    invariant: "patient-existiert",
    message: `Der Patient mit der Nummer ${patientennummer} ist nicht aufgenommen. Bitte wählen Sie einen aufgenommenen Patienten.`,
  };
}
