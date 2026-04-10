// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import type { LeistungenRepository } from "../infrastructure/leistungen_repository";
import {
  type LeistungenQuery,
  LeistungenQueryResult,
} from "../../shared/domain/leistungen_query";

export class LeistungenQueryHandler {
  static create({
    leistungenRepository,
  }: {
    leistungenRepository: LeistungenRepository;
  }) {
    return new LeistungenQueryHandler(leistungenRepository);
  }

  #leistungenRepository: LeistungenRepository;

  private constructor(leistungenRepository: LeistungenRepository) {
    this.#leistungenRepository = leistungenRepository;
  }

  async handle(query: LeistungenQuery) {
    const leistungen = this.#leistungenRepository.findAllByPatientennummer(
      query.patientennummer,
    );
    return LeistungenQueryResult.create({ leistungen });
  }
}
