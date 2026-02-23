// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { Success } from "@muspellheim/shared";

import {
  type NimmPatientAufCommand,
  type NimmPatientAufCommandStatus,
} from "../../shared/domain/nimm_patient_auf_command";
import type { PatientenRepository } from "../infrastructure/patienten_repository";

export class NimmPatientAufCommandHandler {
  static create({
    patientenRepository,
  }: {
    patientenRepository: PatientenRepository;
  }) {
    return new NimmPatientAufCommandHandler(patientenRepository);
  }

  #patientenRepository: PatientenRepository;

  private constructor(patientenRepository: PatientenRepository) {
    this.#patientenRepository = patientenRepository;
  }

  async handle(
    command: NimmPatientAufCommand,
  ): Promise<NimmPatientAufCommandStatus> {
    const nummer = this.#patientenRepository.create(command);
    return new Success({ nummer });
  }
}
