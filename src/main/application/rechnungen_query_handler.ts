// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  type RechnungenQuery,
  RechnungenQueryResult,
} from "../../shared/domain/rechnungen_query";
import type { RechnungenRepository } from "../infrastructure/rechnungen_repository";

export class RechnungenQueryHandler {
  static create({
    rechnungenRepository,
  }: {
    rechnungenRepository: RechnungenRepository;
  }) {
    return new RechnungenQueryHandler(rechnungenRepository);
  }

  #rechnungenRepository: RechnungenRepository;

  private constructor(rechnungenRepository: RechnungenRepository) {
    this.#rechnungenRepository = rechnungenRepository;
  }

  async handle(query: RechnungenQuery) {
    const rechnungen =
      query.patientennummer != null
        ? this.#rechnungenRepository.findAllByPatientennummer(
            query.patientennummer,
          )
        : this.#rechnungenRepository.findAll();
    return RechnungenQueryResult.create({ rechnungen });
  }
}
