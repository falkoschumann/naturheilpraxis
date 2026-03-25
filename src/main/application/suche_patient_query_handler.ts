// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  type PatientQuery,
  PatientQueryResult,
} from "../../shared/domain/suche_patient_query";
import type { PatientenRepository } from "../infrastructure/patienten_repository";
import { EinstellungenProvider } from "../infrastructure/einstellungen_provider";
import type { UhrProvider } from "../infrastructure/uhr_provider";
import { Patient } from "../../shared/domain/patient";

export class SuchePatientQueryHandler {
  static create({
    patientenRepository,
    einstellungenProvider,
    uhrProvider,
  }: {
    patientenRepository: PatientenRepository;
    einstellungenProvider: EinstellungenProvider;
    uhrProvider: UhrProvider;
  }) {
    return new SuchePatientQueryHandler(
      patientenRepository,
      einstellungenProvider,
      uhrProvider,
    );
  }

  #patientenRepository: PatientenRepository;
  #einstellungenProvider: EinstellungenProvider;
  #uhrProvider: UhrProvider;

  private constructor(
    patientenRepository: PatientenRepository,
    einstellungenprovider: EinstellungenProvider,
    uhrProvider: UhrProvider,
  ) {
    this.#patientenRepository = patientenRepository;
    this.#einstellungenProvider = einstellungenprovider;
    this.#uhrProvider = uhrProvider;
  }

  async handle(query: PatientQuery) {
    const einstellungen = this.#einstellungenProvider.lade();

    if (query.nummer != null) {
      const patient = this.#patientenRepository.findByNummer(query.nummer);
      return PatientQueryResult.create({ ...einstellungen, patient });
    }

    const annahmejahr = this.#uhrProvider.getDatum().year;
    const praxis = einstellungen.praxen[0];
    const schluesselworte = einstellungen.standardSchluesselworte;
    return PatientQueryResult.create({
      ...einstellungen,
      patient: Patient.create({ annahmejahr, praxis, schluesselworte }),
    });
  }
}
