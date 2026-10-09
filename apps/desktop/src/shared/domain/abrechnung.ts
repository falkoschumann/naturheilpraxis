// Copyright (c) 2026 Falko Schumann. MIT license.

import {
  leistungTag,
  patientTag,
  praxisTag,
  rechnungstagTag,
  rechnungTag,
  type EventQuery,
} from "./events.ts";
import type {
  LeistungErbrachtEvent,
  LeistungGeaendertEvent,
  LeistungGeloeschtEvent,
} from "./leistungserbringung.ts";
import type { PatientAufgenommenEvent } from "./patientenaufnahme.ts";
import type { PatientendatenGeaendertEvent } from "./patientenkartei.ts";
import { patientExistiert, praxisExistiert } from "./patientenregeln.ts";
import type { PraxisAngelegtEvent } from "./praxisverwaltung.ts";
import { fail, ok, type Rejection, type Result } from "./result.ts";
import type { Patientennummer, Rechnungsnummer } from "./value-objects.ts";

export type RechnungErstellenCommand = Readonly<{
  type: "rechnung-erstellen";
  data: Readonly<{
    rechnungId: string;
    praxiskuerzel: string;
    patientennummer: Patientennummer;
    diagnosetext: string;
    rechnungstext: string;
    leistungen: readonly string[];
  }>;
}>;

// The Patient of a Rechnung cannot be changed.
export type RechnungAendernCommand = Readonly<{
  type: "rechnung-aendern";
  data: Readonly<{
    rechnungId: string;
    praxiskuerzel: string;
    diagnosetext: string;
    rechnungstext: string;
    leistungen: readonly string[];
  }>;
}>;

export type EntwurfLoeschenCommand = Readonly<{
  type: "entwurf-loeschen";
  data: Readonly<{ rechnungId: string }>;
}>;

export type RechnungVersendenCommand = Readonly<{
  type: "rechnung-versenden";
  data: Readonly<{
    rechnungId: string;
    // Needed to consult the Rechnungen of the Patient on the same day.
    patientennummer: Patientennummer;
    // An ISO date like 2026-09-20.
    datum: string;
  }>;
}>;

// Takes back the payment of a paid Rechnung or the dispatch of a sent one.
export type RechnungZurueckstufenCommand = Readonly<{
  type: "rechnung-zurueckstufen";
  data: Readonly<{ rechnungId: string }>;
}>;

export type AbrechnungCommand =
  | RechnungErstellenCommand
  | RechnungAendernCommand
  | EntwurfLoeschenCommand
  | RechnungVersendenCommand
  | RechnungZurueckstufenCommand;

export type RechnungErstelltEvent = Readonly<{
  type: "rechnung-erstellt";
  data: Readonly<{
    rechnungId: string;
    praxiskuerzel: string;
    patientennummer: Patientennummer;
    diagnosetext: string;
    rechnungstext: string;
    leistungen: readonly string[];
  }>;
}>;

export type RechnungGeaendertEvent = Readonly<{
  type: "rechnung-geaendert";
  data: Readonly<{
    rechnungId: string;
    praxiskuerzel: string;
    diagnosetext: string;
    rechnungstext: string;
    leistungen: readonly string[];
  }>;
}>;

export type EntwurfGeloeschtEvent = Readonly<{
  type: "entwurf-geloescht";
  data: Readonly<{ rechnungId: string }>;
}>;

export type RechnungVersendetEvent = Readonly<{
  type: "rechnung-versendet";
  data: Readonly<{
    rechnungId: string;
    patientennummer: Patientennummer;
    rechnungsnummer: Rechnungsnummer;
    // An ISO date like 2026-09-20.
    datum: string;
  }>;
}>;

export type RechnungBezahltEvent = Readonly<{
  type: "rechnung-bezahlt";
  data: Readonly<{ rechnungId: string }>;
}>;

export type RechnungszahlungZurueckgenommenEvent = Readonly<{
  type: "rechnungszahlung-zurueckgenommen";
  data: Readonly<{ rechnungId: string }>;
}>;

// The Rechnung is a draft again; the event names the freed Rechnungsnummer and
// the former date.
export type RechnungsversandZurueckgenommenEvent = Readonly<{
  type: "rechnungsversand-zurueckgenommen";
  data: Readonly<{
    rechnungId: string;
    patientennummer: Patientennummer;
    rechnungsnummer: Rechnungsnummer;
    datum: string;
  }>;
}>;

export type AbrechnungEvent =
  | RechnungErstelltEvent
  | RechnungGeaendertEvent
  | EntwurfGeloeschtEvent
  | RechnungVersendetEvent
  | RechnungBezahltEvent
  | RechnungszahlungZurueckgenommenEvent
  | RechnungsversandZurueckgenommenEvent;

// All events the Abrechnung consults.
export type AbrechnungDcbEvent =
  | AbrechnungEvent
  | LeistungErbrachtEvent
  | LeistungGeaendertEvent
  | LeistungGeloeschtEvent
  | PraxisAngelegtEvent
  | PatientAufgenommenEvent
  | PatientendatenGeaendertEvent;

type Rechnungsstatus = "entwurf" | "versendet" | "bezahlt";

type Rechnung = Readonly<{
  patientennummer: Patientennummer;
  leistungen: readonly string[];
  status: Rechnungsstatus;
  rechnungsnummer?: Rechnungsnummer;
  datum?: string;
}>;

// The consulted events are about the Rechnung of the command, the Leistungen
// of the command and all Rechnungen that contain or contained them, the Praxis
// and the Patient.
export type AbrechnungState = Readonly<{
  rechnungen: Readonly<Record<string, Rechnung>>;
  // The Patient of each Leistung that is erbracht and not gelöscht.
  leistungen: Readonly<Record<string, Patientennummer>>;
  praxisAngelegt: boolean;
  patientAufgenommen: boolean;
  anschriftVorhanden: boolean;
  // The Rechnungsnummern of the sent and paid Rechnungen of the Patient on the
  // day of the dispatch.
  vergebeneRechnungsnummern: ReadonlySet<Rechnungsnummer>;
}>;

export const initialState: AbrechnungState = {
  rechnungen: {},
  leistungen: {},
  praxisAngelegt: false,
  patientAufgenommen: false,
  anschriftVorhanden: false,
  vergebeneRechnungsnummern: new Set(),
};

export function consults(command: AbrechnungCommand): EventQuery {
  const rechnung = {
    types: [
      "rechnung-erstellt",
      "rechnung-geaendert",
      "entwurf-geloescht",
      "rechnung-versendet",
      "rechnung-bezahlt",
      "rechnungszahlung-zurueckgenommen",
      "rechnungsversand-zurueckgenommen",
    ] as const,
    tags: [rechnungTag(command.data.rechnungId)],
  };
  switch (command.type) {
    case "entwurf-loeschen":
    case "rechnung-zurueckstufen":
      return [rechnung];
    case "rechnung-versenden": {
      const { patientennummer, datum } = command.data;
      return [
        rechnung,
        {
          types: ["rechnung-versendet", "rechnungsversand-zurueckgenommen"],
          tags: [rechnungstagTag(patientennummer, datum)],
        },
        {
          types: ["patient-aufgenommen", "patientendaten-geaendert"],
          tags: [patientTag(patientennummer)],
        },
      ];
    }
  }

  const leistungen = command.data.leistungen.map((leistungId) => ({
    types: [
      "rechnung-erstellt",
      "rechnung-geaendert",
      "entwurf-geloescht",
      "leistung-erbracht",
      "leistung-geaendert",
      "leistung-geloescht",
    ] as const,
    tags: [leistungTag(leistungId)],
  }));
  const praxis = {
    types: ["praxis-angelegt"] as const,
    tags: [praxisTag(command.data.praxiskuerzel)],
  };
  if (command.type === "rechnung-aendern") {
    return [rechnung, ...leistungen, praxis];
  }
  return [
    rechnung,
    ...leistungen,
    praxis,
    {
      types: ["patient-aufgenommen"],
      tags: [patientTag(command.data.patientennummer)],
    },
  ];
}

export function decide(
  state: AbrechnungState,
  command: AbrechnungCommand,
): Result<AbrechnungEvent[], Rejection> {
  const rechnung = state.rechnungen[command.data.rechnungId];
  switch (command.type) {
    case "rechnung-erstellen": {
      if (rechnung !== undefined) {
        return fail({ message: "Die Rechnung ist bereits erstellt." });
      }
      const rejection =
        praxisExistiert(command.data.praxiskuerzel, state.praxisAngelegt) ??
        patientExistiert(
          command.data.patientennummer,
          state.patientAufgenommen,
        ) ??
        pruefeLeistungen(
          state,
          command.data.rechnungId,
          command.data.patientennummer,
          command.data.leistungen,
        );
      if (rejection !== undefined) {
        return fail(rejection);
      }
      return ok([{ type: "rechnung-erstellt", data: command.data }]);
    }
    case "rechnung-aendern": {
      if (rechnung === undefined) {
        return fail({
          message:
            "Die Rechnung ist nicht vorhanden. Möglicherweise wurde sie inzwischen gelöscht.",
        });
      }
      const rejection =
        nurImEntwurf(rechnung, {
          invariant: "nur-im-entwurf-aendern",
          message:
            "Die Rechnung ist bereits versendet und kann nicht mehr geändert werden. Nehmen Sie zuerst den Versand zurück.",
        }) ??
        praxisExistiert(command.data.praxiskuerzel, state.praxisAngelegt) ??
        pruefeLeistungen(
          state,
          command.data.rechnungId,
          rechnung.patientennummer,
          command.data.leistungen,
        );
      if (rejection !== undefined) {
        return fail(rejection);
      }
      return ok([{ type: "rechnung-geaendert", data: command.data }]);
    }
    case "entwurf-loeschen": {
      // Deleting is idempotent.
      if (rechnung === undefined) {
        return ok([]);
      }
      const rejection = nurImEntwurf(rechnung, {
        invariant: "nur-im-entwurf-loeschen",
        message:
          "Die Rechnung ist bereits versendet und kann nicht gelöscht werden. Nehmen Sie zuerst den Versand zurück.",
      });
      if (rejection !== undefined) {
        return fail(rejection);
      }
      return ok([
        {
          type: "entwurf-geloescht",
          data: { rechnungId: command.data.rechnungId },
        },
      ]);
    }
    case "rechnung-versenden": {
      if (rechnung === undefined) {
        return fail({
          message:
            "Die Rechnung ist nicht vorhanden. Möglicherweise wurde sie inzwischen gelöscht.",
        });
      }
      const rejection =
        nurImEntwurf(rechnung, {
          invariant: "nur-entwurf-versenden",
          message:
            "Die Rechnung ist bereits versendet. Um sie erneut zu versenden, nehmen Sie zuerst den Versand zurück.",
        }) ??
        patientDerRechnung(rechnung, command.data.patientennummer) ??
        rechnungsanschriftVorhanden(state);
      if (rejection !== undefined) {
        return fail(rejection);
      }
      const { rechnungId, patientennummer, datum } = command.data;
      return ok([
        {
          type: "rechnung-versendet",
          data: {
            rechnungId,
            patientennummer,
            rechnungsnummer: freieRechnungsnummer(
              patientennummer,
              datum,
              state.vergebeneRechnungsnummern,
            ),
            datum,
          },
        },
      ]);
    }
    case "rechnung-zurueckstufen": {
      if (rechnung === undefined) {
        return fail({
          message:
            "Die Rechnung ist nicht vorhanden. Möglicherweise wurde sie inzwischen gelöscht.",
        });
      }
      const { rechnungId } = command.data;
      if (rechnung.status === "bezahlt") {
        return ok([
          { type: "rechnungszahlung-zurueckgenommen", data: { rechnungId } },
        ]);
      }
      if (
        rechnung.status === "versendet" &&
        rechnung.rechnungsnummer !== undefined &&
        rechnung.datum !== undefined
      ) {
        return ok([
          {
            type: "rechnungsversand-zurueckgenommen",
            data: {
              rechnungId,
              patientennummer: rechnung.patientennummer,
              rechnungsnummer: rechnung.rechnungsnummer,
              datum: rechnung.datum,
            },
          },
        ]);
      }
      return fail({
        invariant: "entwurf-nicht-zurueckstufen",
        message: "Die Rechnung ist ein Entwurf und wurde noch nicht versendet.",
      });
    }
  }
}

// The events of a Rechnung are tagged with all Leistungen the Rechnung contains
// or contained, so that the Leistungserbringung and other Rechnungen find them.
// Only the Leistungen not given in the event are added here.
export function tags(
  state: AbrechnungState,
  event: AbrechnungEvent,
): readonly string[] {
  if (event.type === "rechnung-erstellt") {
    return [];
  }
  const bisherige = state.rechnungen[event.data.rechnungId]?.leistungen ?? [];
  const genannte =
    event.type === "rechnung-geaendert" ? event.data.leistungen : [];
  return bisherige
    .filter((leistungId) => !genannte.includes(leistungId))
    .map(leistungTag);
}

export function evolve(
  state: AbrechnungState,
  event: AbrechnungDcbEvent,
): AbrechnungState {
  switch (event.type) {
    case "rechnung-erstellt":
      return {
        ...state,
        rechnungen: {
          ...state.rechnungen,
          [event.data.rechnungId]: {
            patientennummer: event.data.patientennummer,
            leistungen: event.data.leistungen,
            status: "entwurf",
          },
        },
      };
    case "rechnung-geaendert":
      return aendereRechnung(state, event.data.rechnungId, {
        leistungen: event.data.leistungen,
      });
    case "entwurf-geloescht":
      return {
        ...state,
        rechnungen: Object.fromEntries(
          Object.entries(state.rechnungen).filter(
            ([rechnungId]) => rechnungId !== event.data.rechnungId,
          ),
        ),
      };
    case "rechnung-versendet":
      return {
        ...aendereRechnung(state, event.data.rechnungId, {
          status: "versendet",
          rechnungsnummer: event.data.rechnungsnummer,
          datum: event.data.datum,
        }),
        vergebeneRechnungsnummern: new Set([
          ...state.vergebeneRechnungsnummern,
          event.data.rechnungsnummer,
        ]),
      };
    case "rechnungszahlung-zurueckgenommen":
      return aendereRechnung(state, event.data.rechnungId, {
        status: "versendet",
      });
    case "rechnung-bezahlt":
      return aendereRechnung(state, event.data.rechnungId, {
        status: "bezahlt",
      });
    case "rechnungsversand-zurueckgenommen":
      return {
        ...aendereRechnung(state, event.data.rechnungId, {
          status: "entwurf",
          rechnungsnummer: undefined,
          datum: undefined,
        }),
        vergebeneRechnungsnummern: new Set(
          [...state.vergebeneRechnungsnummern].filter(
            (nummer) => nummer !== event.data.rechnungsnummer,
          ),
        ),
      };
    case "leistung-erbracht":
    case "leistung-geaendert":
      return {
        ...state,
        leistungen: {
          ...state.leistungen,
          [event.data.leistungId]: event.data.patientennummer,
        },
      };
    case "leistung-geloescht":
      return {
        ...state,
        leistungen: Object.fromEntries(
          Object.entries(state.leistungen).filter(
            ([leistungId]) => leistungId !== event.data.leistungId,
          ),
        ),
      };
    case "praxis-angelegt":
      return { ...state, praxisAngelegt: true };
    case "patient-aufgenommen":
      return {
        ...state,
        patientAufgenommen: true,
        anschriftVorhanden: event.data.anschrift !== undefined,
      };
    case "patientendaten-geaendert":
      return {
        ...state,
        anschriftVorhanden: event.data.anschrift !== undefined,
      };
  }
}

export function evolveAll(
  state: AbrechnungState,
  events: readonly AbrechnungDcbEvent[],
): AbrechnungState {
  return events.reduce(evolve, state);
}

function aendereRechnung(
  state: AbrechnungState,
  rechnungId: string,
  aenderung: Partial<Rechnung>,
): AbrechnungState {
  const rechnung = state.rechnungen[rechnungId];
  if (rechnung === undefined) {
    return state;
  }
  return {
    ...state,
    rechnungen: {
      ...state.rechnungen,
      [rechnungId]: { ...rechnung, ...aenderung },
    },
  };
}

function nurImEntwurf(
  rechnung: Rechnung,
  rejection: Rejection,
): Rejection | undefined {
  return rechnung.status === "entwurf" ? undefined : rejection;
}

function pruefeLeistungen(
  state: AbrechnungState,
  rechnungId: string,
  patientennummer: Patientennummer,
  leistungen: readonly string[],
): Rejection | undefined {
  if (leistungen.length === 0) {
    return {
      message:
        "Eine Rechnung enthält mindestens eine Leistung. Bitte wählen Sie Leistungen aus.",
    };
  }
  if (
    leistungen.some((leistungId) => state.leistungen[leistungId] === undefined)
  ) {
    return {
      invariant: "leistungen-existieren",
      message:
        "Eine der Leistungen ist nicht vorhanden, möglicherweise wurde sie inzwischen gelöscht. Bitte wählen Sie die Leistungen erneut aus.",
    };
  }
  if (
    leistungen.some(
      (leistungId) => state.leistungen[leistungId] !== patientennummer,
    )
  ) {
    return {
      invariant: "leistungen-des-patienten",
      message:
        "Eine der Leistungen gehört zu einem anderen Patienten. Bitte wählen Sie nur Leistungen des Patienten der Rechnung aus.",
    };
  }
  const andereRechnungen = Object.entries(state.rechnungen).filter(
    ([id]) => id !== rechnungId,
  );
  if (
    andereRechnungen.some(([, rechnung]) =>
      rechnung.leistungen.some((leistungId) => leistungen.includes(leistungId)),
    )
  ) {
    return {
      invariant: "leistungen-nicht-abgerechnet",
      message:
        "Eine der Leistungen ist bereits in einer anderen Rechnung enthalten. Bitte wählen Sie nur nicht abgerechnete Leistungen aus.",
    };
  }
  return undefined;
}

function patientDerRechnung(
  rechnung: Rechnung,
  patientennummer: Patientennummer,
): Rejection | undefined {
  if (rechnung.patientennummer === patientennummer) {
    return undefined;
  }
  return {
    invariant: "patient-der-rechnung",
    message:
      "Die Rechnung gehört zu einem anderen Patienten. Bitte versenden Sie sie von dessen Karteikarte aus.",
  };
}

// An Anschrift always has Straße, Postleitzahl and Ort.
function rechnungsanschriftVorhanden(
  state: AbrechnungState,
): Rejection | undefined {
  if (state.anschriftVorhanden) {
    return undefined;
  }
  return {
    invariant: "rechnungsanschrift-vorhanden",
    message:
      "Die Rechnung kann nicht versendet werden, weil die Anschrift des Patienten fehlt. Bitte ergänzen Sie Straße, Postleitzahl und Ort in den Stammdaten.",
  };
}

// Like "1234/260920" for the first Rechnung of the day and "1234/260920-2" for
// the second; the lowest free number is taken.
function freieRechnungsnummer(
  patientennummer: Patientennummer,
  datum: string,
  vergeben: ReadonlySet<Rechnungsnummer>,
): Rechnungsnummer {
  const [jahr = "", monat = "", tag = ""] = datum.split("-");
  const basis = `${patientennummer}/${jahr.slice(2)}${monat}${tag}`;
  if (!vergeben.has(basis)) {
    return basis;
  }
  let zahl = 2;
  while (vergeben.has(`${basis}-${zahl}`)) {
    zahl += 1;
  }
  return `${basis}-${zahl}`;
}
