// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Patient } from "../../shared/domain/patient";
import {
  type PatientQuery,
  PatientQueryResult,
} from "../../shared/domain/patient_query";
import type { PatientenRepository } from "../infrastructure/patienten_repository";
import { EinstellungenProvider } from "../infrastructure/einstellungen_provider";
import type { KalenderProvider } from "../infrastructure/kalender_provider";

export class PatientQueryHandler {
  static create({
    patientenRepository,
    einstellungenProvider,
    uhrProvider,
  }: {
    patientenRepository: PatientenRepository;
    einstellungenProvider: EinstellungenProvider;
    uhrProvider: KalenderProvider;
  }) {
    return new PatientQueryHandler(
      patientenRepository,
      einstellungenProvider,
      uhrProvider,
    );
  }

  #patientenRepository: PatientenRepository;
  #einstellungenProvider: EinstellungenProvider;
  #uhrProvider: KalenderProvider;

  private constructor(
    patientenRepository: PatientenRepository,
    einstellungenProvider: EinstellungenProvider,
    uhrProvider: KalenderProvider,
  ) {
    this.#patientenRepository = patientenRepository;
    this.#einstellungenProvider = einstellungenProvider;
    this.#uhrProvider = uhrProvider;
  }

  async handle(query: PatientQuery) {
    const einstellungen = this.#einstellungenProvider.lade();

    const schlüsselworte = einstellungen.schlüsselworte.map(
      (schlüsselwort) => schlüsselwort.name,
    );

    if (query.nummer != null) {
      const patient = this.#patientenRepository.findByNummer(query.nummer);
      return PatientQueryResult.create({
        ...einstellungen,
        schlüsselworte,
        patient,
      });
    }

    const annahmejahr = this.#uhrProvider.getDatum().year;
    const praxis = einstellungen.praxen[0];
    const defaultSchlüsselworte = einstellungen.schlüsselworte
      .filter((schlüsselwort) => schlüsselwort.istDefault)
      .map((schlüsselwort) => schlüsselwort.name);
    return PatientQueryResult.create({
      ...einstellungen,
      schlüsselworte,
      patient: Patient.create({
        annahmejahr,
        praxis,
        schlüsselworte: defaultSchlüsselworte,
      }),
    });
  }
}
