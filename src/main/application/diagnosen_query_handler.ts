// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  type DiagnosenQuery,
  DiagnosenQueryResult,
} from "../../shared/domain/diagnosen_query";
import type { DiagnosenRepository } from "../infrastructure/diagnosen_repository";

export class DiagnosenQueryHandler {
  static create({
    diagnosenRepository,
  }: {
    diagnosenRepository: DiagnosenRepository;
  }) {
    return new DiagnosenQueryHandler(diagnosenRepository);
  }

  #diagnosenRepository: DiagnosenRepository;

  private constructor(diagnosenRepository: DiagnosenRepository) {
    this.#diagnosenRepository = diagnosenRepository;
  }

  async handle(query: DiagnosenQuery) {
    const diagnosen = this.#diagnosenRepository.findAllByPatientennummer(
      query.patientennummer,
    );
    return DiagnosenQueryResult.create({ diagnosen });
  }
}
