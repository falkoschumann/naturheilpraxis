// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  type PatientQuery,
  PatientQueryResult,
} from "../../shared/domain/suche_patient_query";
import type { PatientenRepository } from "../infrastructure/patienten_repository";

export class SuchePatientQueryHandler {
  static create({
    patientenRepository,
  }: {
    patientenRepository: PatientenRepository;
  }) {
    return new SuchePatientQueryHandler(patientenRepository);
  }

  #patientenRepository: PatientenRepository;

  private constructor(patientenRepository: PatientenRepository) {
    this.#patientenRepository = patientenRepository;
  }

  async handle(query: PatientQuery) {
    const patient = this.#patientenRepository.findByNummer(query.nummer);
    return PatientQueryResult.create({ patient });
  }
}
