// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  type PatientQuery,
  PatientQueryResult,
} from "../../shared/domain/suche_patient_query";
import type { PatientenRepository } from "../infrastructure/patienten_repository";
import { EinstellungenGateway } from "../infrastructure/einstellungen_gateway";
import type { UhrProvider } from "../infrastructure/uhr_provider";
import { Patient } from "../../shared/domain/patient";

export class SuchePatientQueryHandler {
  static create({
    patientenRepository,
    einstellungenGateway,
    uhrProvider,
  }: {
    patientenRepository: PatientenRepository;
    einstellungenGateway: EinstellungenGateway;
    uhrProvider: UhrProvider;
  }) {
    return new SuchePatientQueryHandler(
      patientenRepository,
      einstellungenGateway,
      uhrProvider,
    );
  }

  #patientenRepository: PatientenRepository;
  #einstellungenGateway: EinstellungenGateway;
  #uhrProvider: UhrProvider;

  private constructor(
    patientenRepository: PatientenRepository,
    einstellungenGateway: EinstellungenGateway,
    uhrProvider: UhrProvider,
  ) {
    this.#patientenRepository = patientenRepository;
    this.#einstellungenGateway = einstellungenGateway;
    this.#uhrProvider = uhrProvider;
  }

  async handle(query: PatientQuery) {
    if (query.nummer != null) {
      const patient = this.#patientenRepository.findByNummer(query.nummer);
      return PatientQueryResult.create({ patient });
    }

    const annahmejahr = this.#uhrProvider.getDatum().year;
    const einstellungen = this.#einstellungenGateway.lade();
    const praxis = einstellungen.praxen[0];
    const schluesselworte = einstellungen.standardSchluesselworte;
    return PatientQueryResult.create({
      patient: Patient.create({ annahmejahr, praxis, schluesselworte }),
    });
  }
}
