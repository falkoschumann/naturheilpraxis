// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import {
  type PatientenQuery,
  PatientenQueryResult,
} from "../../shared/domain/suche_patienten_query";
import type { PatientenRepository } from "../infrastructure/patienten_repository";

export class SuchePatientenQueryHandler {
  static create({
    patientenRepository,
  }: {
    patientenRepository: PatientenRepository;
  }) {
    return new SuchePatientenQueryHandler(patientenRepository);
  }

  #patientenRepository: PatientenRepository;

  private constructor(patientenRepository: PatientenRepository) {
    this.#patientenRepository = patientenRepository;
  }

  async handle(_query: PatientenQuery) {
    const patienten = this.#patientenRepository.findAll();
    return PatientenQueryResult.create({ patienten });
  }
}
