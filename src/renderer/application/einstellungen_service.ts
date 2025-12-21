// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useState } from "react";

import { Einstellungen } from "../../shared/domain/einstellungen";
import { EinstellungenDto } from "../../shared/infrastructure/einstellungen";

export function useEinstellungen() {
  const [current, setCurrent] = useState(Einstellungen.createDefault());

  async function load() {
    const dto = await window.naturheilpraxis.ladeEinstellungen();
    setCurrent(EinstellungenDto.create(dto).validate());
  }

  async function store() {
    const dto = EinstellungenDto.fromModel(current);
    await window.naturheilpraxis.sichereEinstellungen(dto);
  }

  useEffect(() => {
    (() => load())();
  }, []);

  return { current, setCurrent, store };
}
