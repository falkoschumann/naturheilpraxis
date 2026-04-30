// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Patient } from "../../shared/domain/patient";
import {
  type PatientQuery,
  PatientQueryResult,
} from "../../shared/domain/patient_query";
import type { PatientenRepository } from "../infrastructure/patienten_repository";
import { EinstellungenRepository } from "../infrastructure/einstellungen_repository";
import type { KalenderProvider } from "../infrastructure/kalender_provider";

export class PatientQueryHandler {
  static create({
    patientenRepository,
    einstellungenRepository,
    uhrProvider,
  }: {
    patientenRepository: PatientenRepository;
    einstellungenRepository: EinstellungenRepository;
    uhrProvider: KalenderProvider;
  }) {
    return new PatientQueryHandler(
      patientenRepository,
      einstellungenRepository,
      uhrProvider,
    );
  }

  #patientenRepository: PatientenRepository;
  #einstellungenRepository: EinstellungenRepository;
  #uhrProvider: KalenderProvider;

  private constructor(
    patientenRepository: PatientenRepository,
    einstellungenRepository: EinstellungenRepository,
    uhrProvider: KalenderProvider,
  ) {
    this.#patientenRepository = patientenRepository;
    this.#einstellungenRepository = einstellungenRepository;
    this.#uhrProvider = uhrProvider;
  }

  async handle(query: PatientQuery) {
    const praxen = this.#einstellungenRepository.findAllPraxen();
    const anreden = this.#einstellungenRepository.findAllAnreden();
    const familienstände =
      this.#einstellungenRepository.findAllFamilienstände();
    const schlüsselworte =
      this.#einstellungenRepository.findAllSchlüsselworte();

    if (query.nummer != null) {
      const patient = this.#patientenRepository.findByNummer(query.nummer);
      return PatientQueryResult.create({
        patient,
        praxen,
        anreden,
        familienstände,
        schlüsselworte,
      });
    }

    const annahmejahr = this.#uhrProvider.getDatum().year;
    const praxis = praxen[0];
    const standardschlüsselworte =
      this.#einstellungenRepository.findAllStandardschlüsselworte();
    return PatientQueryResult.create({
      praxen,
      anreden,
      familienstände,
      schlüsselworte,
      patient: Patient.create({
        annahmejahr,
        praxis,
        schlüsselworte: standardschlüsselworte,
      }),
    });
  }
}
