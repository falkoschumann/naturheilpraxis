// Copyright (c) 2026 Falko Schumann. MIT license.

import {
  evolve,
  initialState,
  tags,
  type AbrechnungDcbEvent,
  type AbrechnungState,
} from "../../shared/domain/abrechnung.ts";
import type {
  Diagnose,
  Leistung,
  Patient,
  Praxis,
} from "../../shared/domain/entities.ts";
import type { DomainEvent } from "../../shared/domain/events.ts";
import type {
  Anschrift,
  Euro,
  Kontakt,
  Personenname,
} from "../../shared/domain/value-objects.ts";

// The rows of the legacy database as far as they are migrated. Text columns
// without a value are empty strings.

export type LegacyData = Readonly<{
  fees: readonly LegacyFee[];
  patients: readonly LegacyPatient[];
  activities: readonly LegacyActivity[];
  invoices: readonly LegacyInvoice[];
}>;

export type LegacyFee = Readonly<{
  id: number;
  shortNote: string;
  description: string;
  amount: LegacyAmount;
}>;

export type LegacyPatient = Readonly<{
  id: number;
  agencyId: number | null;
  acceptance: number | null;
  dayOfBirth: string;
  geburtstag: string;
  geburtsmonat: string;
  geburtsjahr: string;
  title: string;
  academicTitle: string;
  forename: string;
  surname: string;
  street: string;
  streetNumber: string;
  postalCode: string;
  city: string;
  country: string;
  callNumber: string;
  mobilePhone: string;
  email: string;
  occupation: string;
  familyStatus: string;
  citizenship: string;
  memorandum: string;
  // The number of another patient or a name as free text.
  partnerFrom: number | string;
  childFrom: number | string;
  // The names from HANDLINGLIST assigned in HANDLINGDATA.
  handlings: readonly string[];
}>;

export type LegacyActivity = Readonly<{
  id: number;
  agencyId: number | null;
  customerId: number;
  // 0 or less if the activity is not invoiced.
  invoiceId: number;
  date: string;
  shortNote: string;
  description: string;
  quantity: number;
  amount: LegacyAmount;
}>;

export type LegacyInvoice = Readonly<{
  id: number;
  agencyId: number | null;
  customerId: number;
  date: string;
  invoiceNumber: string;
  cleared: number;
  creditNote: number | null;
  // The text of the Diagnose.
  comment: string;
  // The Rechnungstext.
  invoiceNote: string;
}>;

// Euro as number or as text with a decimal comma like "20,50".
export type LegacyAmount = number | string | null;

export type MigrationResult = Readonly<{
  events: readonly DomainEvent[];
  // What was left out or could not be taken over as is.
  notes: readonly string[];
}>;

// A Praxis and the legacy agency it was. An agency without a Praxis like a
// pseudo agency for all Praxen or a missing agency is no Praxis.
export type LegacyPraxis = Readonly<{
  agencyId: number;
  praxis: Praxis;
}>;

// A date nobody is born on marks an unknown Geburtsdatum.
const UNBEKANNTES_GEBURTSDATUM = "1800-01-01";
const UNBEKANNTES_AUFNAHMEJAHR = 1800;
const FRUEHESTES_GEBURTSJAHR = 1880;

const ANREDE_KORREKTUREN: Readonly<Record<string, string>> = {
  Fau: "Frau",
  Frai: "Frau",
  Frua: "Frau",
  Her: "Herr",
  Herrd: "Herr",
  Herrn: "Herr",
  herr: "Herr",
};

const FAMILIENSTAND_PRAEFIXE: readonly (readonly [string, string])[] = [
  ["verh", "verheiratet"],
  ["veh", "verheiratet"],
  ["verw", "verwitwet"],
  ["gesch", "geschieden"],
  ["getr", "getrennt lebend"],
];

const INLAENDISCHE_STAATEN = new Set(["", "Deutschland", "D", "d"]);

// Translates the legacy data into the events that would have been published
// if the data had been recorded with this application. The first Praxis is the
// main Praxis, which takes the Patienten no other Praxis can be derived for.
export function migrateLegacyData(
  data: LegacyData,
  praxen: readonly LegacyPraxis[],
  createId: () => string,
): MigrationResult {
  const [hauptpraxis] = praxen;
  if (hauptpraxis === undefined) {
    throw new Error("Es ist keine Praxis angegeben.");
  }
  const hauptpraxiskuerzel = hauptpraxis.praxis.praxiskuerzel;
  const praxiskuerzelOfAgency = new Map(
    praxen.map(({ agencyId, praxis }) => [agencyId, praxis.praxiskuerzel]),
  );
  const praxisOf = (agencyId: number | null) =>
    agencyId === null ? undefined : praxiskuerzelOfAgency.get(agencyId);
  const notes: string[] = [];
  const activitiesByInvoice = groupBy(
    data.activities.filter((activity) => activity.invoiceId > 0),
    (activity) => activity.invoiceId,
  );
  const activitiesByPatient = groupBy(
    data.activities,
    (activity) => activity.customerId,
  );
  const invoicesByPatient = groupBy(
    data.invoices,
    (invoice) => invoice.customerId,
  );

  const patients = data.patients.filter((patient) => {
    const leer =
      patient.forename.trim() === "" &&
      patient.surname.trim() === "" &&
      !activitiesByPatient.has(patient.id) &&
      !invoicesByPatient.has(patient.id);
    if (leer) {
      notes.push(
        `Patient ${patient.id} ohne Namen und Leistungen wird nicht übernommen.`,
      );
    }
    return !leer;
  });
  const patientennummern = new Set(patients.map((patient) => patient.id));

  // The Praxis an invoice names itself or derives from its activities.
  const eigenePraxisDerRechnung = (invoice: LegacyInvoice) =>
    praxisOf(invoice.agencyId) ??
    (activitiesByInvoice.get(invoice.id) ?? [])
      .map((activity) => praxisOf(activity.agencyId))
      .find((praxis) => praxis !== undefined);

  const praxisDesPatienten = new Map(
    patients.map((patient) => [
      patient.id,
      praxisOf(patient.agencyId) ??
        sortByDate(invoicesByPatient.get(patient.id) ?? [])
          .map(eigenePraxisDerRechnung)
          .find((praxis) => praxis !== undefined) ??
        sortByDate(activitiesByPatient.get(patient.id) ?? [])
          .map((activity) => praxisOf(activity.agencyId))
          .find((praxis) => praxis !== undefined) ??
        hauptpraxiskuerzel,
    ]),
  );
  const patientenpraxis = (patientennummer: number) =>
    praxisDesPatienten.get(patientennummer) ?? hauptpraxiskuerzel;

  const praxisDerRechnung = (invoice: LegacyInvoice) =>
    eigenePraxisDerRechnung(invoice) ?? patientenpraxis(invoice.customerId);

  const invoices = data.invoices.filter((invoice) => {
    if (!patientennummern.has(invoice.customerId)) {
      return false;
    }
    if (!activitiesByInvoice.has(invoice.id)) {
      notes.push(
        `Rechnung ${invoice.id} ohne Leistungen wird nicht übernommen.`,
      );
      return false;
    }
    return true;
  });
  const invoicesById = new Map(
    invoices.map((invoice) => [invoice.id, invoice]),
  );

  const leistungen = sortByDate(
    data.activities
      .filter((activity) => patientennummern.has(activity.customerId))
      .map((activity) => {
        const invoice = invoicesById.get(activity.invoiceId);
        return {
          activity,
          leistung: {
            leistungId: createId(),
            praxiskuerzel:
              praxisOf(activity.agencyId) ??
              (invoice === undefined
                ? patientenpraxis(activity.customerId)
                : praxisDerRechnung(invoice)),
            patientennummer: activity.customerId,
            datum:
              activity.date.trim() ||
              invoice?.date.trim() ||
              fruehestesDatum(activitiesByInvoice.get(activity.invoiceId)) ||
              "",
            ziffer: activity.shortNote.trim(),
            bezeichnung: activity.description.trim(),
            anzahl: activity.quantity,
            einzelbetrag: euroOf(activity.amount),
          } satisfies Leistung,
        };
      }),
    ({ leistung }) => leistung.datum,
    ({ activity }) => activity.id,
  );
  for (const { activity, leistung } of leistungen) {
    if (leistung.datum === "") {
      notes.push(`Leistung ${activity.id} hat kein Datum.`);
    }
  }
  const leistungIdOf = new Map(
    leistungen.map(({ activity, leistung }) => [
      activity.id,
      leistung.leistungId,
    ]),
  );

  return {
    events: [
      ...praxisEvents(
        praxen.map(({ praxis }) => praxis),
        data.invoices,
        praxisDerRechnung,
      ),
      ...gebuehrEvents(data.fees),
      ...patients.map((patient) => ({
        type: "patient-aufgenommen" as const,
        data: patientOf(
          patient,
          patientenpraxis(patient.id),
          patientennummern,
          activitiesByPatient.get(patient.id),
        ),
      })),
      ...diagnoseEvents(
        data.invoices.filter((invoice) =>
          patientennummern.has(invoice.customerId),
        ),
        activitiesByInvoice,
        praxisDerRechnung,
        createId,
        notes,
      ),
      ...leistungen.map(({ leistung }) => ({
        type: "leistung-erbracht" as const,
        data: leistung,
      })),
      ...rechnungEvents(
        invoices,
        activitiesByInvoice,
        leistungIdOf,
        praxisDerRechnung,
        createId,
      ),
    ],
    notes,
  };
}

// The tags a consistency boundary adds to an event besides the tags derived
// from the event. The dispatch and the payment of a Rechnung are tagged with its
// Leistungen like the Abrechnung does.
export function migrationTags(
  events: readonly DomainEvent[],
): (event: DomainEvent) => readonly string[] {
  const tagsOfEvent = new Map<DomainEvent, readonly string[]>();
  let state: AbrechnungState = initialState;
  for (const event of events) {
    if (
      event.type === "rechnung-erstellt" ||
      event.type === "rechnung-versendet" ||
      event.type === "rechnung-bezahlt"
    ) {
      tagsOfEvent.set(event, tags(state, event));
      state = evolve(state, event as AbrechnungDcbEvent);
    }
  }
  return (event) => tagsOfEvent.get(event) ?? [];
}

function praxisEvents(
  praxen: readonly Praxis[],
  invoices: readonly LegacyInvoice[],
  praxisDerRechnung: (invoice: LegacyInvoice) => string,
): DomainEvent[] {
  // The Rechnungstext of the latest Rechnung is the one the Praxis used last.
  const rechnungstexte = new Map<string, string>();
  for (const invoice of sortByDate(invoices)) {
    const rechnungstext = decodeHtmlEntities(invoice.invoiceNote).trim();
    if (rechnungstext !== "") {
      rechnungstexte.set(praxisDerRechnung(invoice), rechnungstext);
    }
  }
  return praxen.map((praxis) => {
    const rechnungstext =
      praxis.rechnungstext ?? rechnungstexte.get(praxis.praxiskuerzel);
    return {
      type: "praxis-angelegt",
      data: rechnungstext === undefined ? praxis : { ...praxis, rechnungstext },
    };
  });
}

function gebuehrEvents(fees: readonly LegacyFee[]): DomainEvent[] {
  const vergeben = new Set<string>();
  return fees
    .toSorted((a, b) => a.id - b.id)
    .map((fee) => {
      const ziffer = eindeutig(fee.shortNote.trim(), vergeben);
      vergeben.add(ziffer);
      return {
        type: "gebuehr-angelegt",
        data: {
          ziffer,
          bezeichnung: fee.description.trim(),
          betrag: euroOf(fee.amount),
        },
      };
    });
}

function eindeutig(ziffer: string, vergeben: ReadonlySet<string>): string {
  if (!vergeben.has(ziffer)) {
    return ziffer;
  }
  let zahl = 2;
  while (vergeben.has(`${ziffer}-${zahl}`)) {
    zahl += 1;
  }
  return `${ziffer}-${zahl}`;
}

function patientOf(
  patient: LegacyPatient,
  praxiskuerzel: string,
  patientennummern: ReadonlySet<number>,
  activities: readonly LegacyActivity[] = [],
): Patient {
  const aufnahmejahr =
    patient.acceptance ||
    Number(fruehestesDatum(activities).slice(0, 4)) ||
    UNBEKANNTES_AUFNAHMEJAHR;
  // The Patient is born before the admission, if it is known.
  const geburtsdatum = geburtsdatumOf(
    patient,
    aufnahmejahr === UNBEKANNTES_AUFNAHMEJAHR
      ? Number.POSITIVE_INFINITY
      : aufnahmejahr,
  );
  const notizen = [
    patient.memorandum.trim(),
    angehoerigeNotiz("Partner", patient.partnerFrom, patientennummern),
    angehoerigeNotiz("Kind von", patient.childFrom, patientennummern),
    geburtsdatum.alt === undefined
      ? ""
      : `Geburtsdatum alt: ${geburtsdatum.alt}`,
  ]
    .filter((zeile) => zeile !== "")
    .join("\n");
  const partnerVon = patientennummerOf(patient.partnerFrom, patientennummern);
  const kindVon = patientennummerOf(patient.childFrom, patientennummern);
  return ohneLeere({
    patientennummer: patient.id,
    praxiskuerzel,
    aufnahmejahr,
    geburtsdatum: geburtsdatum.datum,
    name: personennameOf(patient),
    anschrift: anschriftOf(patient),
    kontakt: kontaktOf(patient),
    beruf: patient.occupation.trim(),
    familienstand: familienstandOf(patient.familyStatus),
    staatsangehoerigkeit: patient.citizenship.trim(),
    notizen,
    partnerVon,
    kindVon,
    schluesselworte:
      patient.handlings.length === 0 ? undefined : patient.handlings,
  }) as Patient;
}

function personennameOf(patient: LegacyPatient): Personenname {
  const anrede = patient.title.trim();
  return ohneLeere({
    anrede: ANREDE_KORREKTUREN[anrede] ?? anrede,
    titel: patient.academicTitle.trim(),
    vorname: patient.forename.trim(),
    nachname: patient.surname.trim(),
  }) as Personenname;
}

function anschriftOf(patient: LegacyPatient): Anschrift | undefined {
  const strasse = `${patient.street.trim()} ${patient.streetNumber.trim()}`;
  const postleitzahl = patient.postalCode.trim();
  const ort = patient.city.trim();
  if (strasse.trim() === "" && postleitzahl === "" && ort === "") {
    return undefined;
  }
  const staat = patient.country.trim();
  return ohneLeere({
    strasse: strasse.trim(),
    postleitzahl,
    ort,
    staat: INLAENDISCHE_STAATEN.has(staat) ? undefined : staat,
  }) as Anschrift;
}

function kontaktOf(patient: LegacyPatient): Kontakt | undefined {
  const kontakt = ohneLeere({
    telefon: patient.callNumber.trim(),
    mobiltelefon: patient.mobilePhone.trim(),
    email: patient.email.trim(),
  });
  return Object.keys(kontakt).length === 0 ? undefined : kontakt;
}

function familienstandOf(familyStatus: string): string {
  const familienstand = familyStatus.trim();
  return (
    FAMILIENSTAND_PRAEFIXE.find(([praefix]) =>
      familienstand.startsWith(praefix),
    )?.[1] ?? familienstand
  );
}

function patientennummerOf(
  verweis: number | string,
  patientennummern: ReadonlySet<number>,
): number | undefined {
  return typeof verweis === "number" && patientennummern.has(verweis)
    ? verweis
    : undefined;
}

function angehoerigeNotiz(
  beziehung: string,
  verweis: number | string,
  patientennummern: ReadonlySet<number>,
): string {
  if (patientennummerOf(verweis, patientennummern) !== undefined) {
    return "";
  }
  // Some names contain control characters like a backspace.
  const name = [...String(verweis)]
    .filter((zeichen) => zeichen >= " ")
    .join("")
    .trim();
  if (name === "" || name === "0") {
    return "";
  }
  return typeof verweis === "number"
    ? `${beziehung}: Nr. ${name}`
    : `${beziehung}: ${name}`;
}

// Corrects obvious mistakes like a swapped day and month, a two-digit year or a
// doubled digit. Otherwise the Geburtsdatum is unknown and the legacy value is
// kept.
function geburtsdatumOf(
  patient: LegacyPatient,
  aufnahmejahr: number,
): Readonly<{ datum: string; alt?: string }> {
  const roh = patient.dayOfBirth.trim();
  const datum = roh === "" ? undefined : korrigiereDatum(roh, aufnahmejahr);
  if (datum !== undefined) {
    return { datum };
  }
  const alt =
    roh ||
    [patient.geburtstag, patient.geburtsmonat, patient.geburtsjahr]
      .map((teil) => teil.trim())
      .filter((teil) => teil !== "")
      .join(".");
  return alt === ""
    ? { datum: UNBEKANNTES_GEBURTSDATUM }
    : { datum: UNBEKANNTES_GEBURTSDATUM, alt };
}

function korrigiereDatum(
  roh: string,
  spaetestesJahr: number,
): string | undefined {
  const match = /^(\d{2,4})-(\d{1,3})-(\d{1,3})$/.exec(roh);
  if (match === null) {
    return undefined;
  }
  const [, jahrText = "", monatText = "", tagText = ""] = match;
  const jahr = Number(
    jahrText.length === 2
      ? `19${jahrText}`
      : jahrText.length === 3
        ? `1${jahrText}`
        : jahrText,
  );
  if (jahr < FRUEHESTES_GEBURTSJAHR || jahr > spaetestesJahr) {
    return undefined;
  }
  const monat = Number(ohneDoppelteZiffer(monatText));
  const tag = Number(ohneDoppelteZiffer(tagText));
  for (const [m, t] of [
    [monat, tag],
    [tag, monat],
  ] as const) {
    if (istDatum(jahr, m, t)) {
      return `${jahr}-${String(m).padStart(2, "0")}-${String(t).padStart(2, "0")}`;
    }
  }
  return undefined;
}

function ohneDoppelteZiffer(text: string): string {
  return text.length === 3 && /^(\d)\1|(\d)\2$/.test(text)
    ? text.replace(/(\d)\1/, "$1")
    : text;
}

function istDatum(jahr: number, monat: number, tag: number): boolean {
  const datum = new Date(Date.UTC(jahr, monat - 1, tag));
  return (
    datum.getUTCFullYear() === jahr &&
    datum.getUTCMonth() === monat - 1 &&
    datum.getUTCDate() === tag
  );
}

// One Diagnose for each Patient and text, made on the earliest Rechnung with
// this text; all Rechnungen with this text refer to it.
function diagnoseEvents(
  invoices: readonly LegacyInvoice[],
  activitiesByInvoice: ReadonlyMap<number, readonly LegacyActivity[]>,
  praxisDerRechnung: (invoice: LegacyInvoice) => string,
  createId: () => string,
  notes: string[],
): DomainEvent[] {
  const gruppen = groupBy(
    invoices.filter((invoice) => invoice.comment.trim() !== ""),
    (invoice) => `${invoice.customerId}\n${invoice.comment.trim()}`,
  );
  const diagnosen: Diagnose[] = [];
  for (const gruppe of gruppen.values()) {
    const sortiert = sortByDate(gruppe);
    const [erste] = sortiert;
    if (erste === undefined) {
      continue;
    }
    const datum =
      fruehestesDatum(sortiert) ||
      fruehestesDatum(
        sortiert.flatMap(
          (invoice) => activitiesByInvoice.get(invoice.id) ?? [],
        ),
      );
    if (datum === "") {
      notes.push(
        `Diagnose der Rechnung ${erste.id} ohne Datum wird nicht übernommen.`,
      );
      continue;
    }
    diagnosen.push({
      diagnoseId: createId(),
      praxiskuerzel: praxisDerRechnung(erste),
      patientennummer: erste.customerId,
      datum,
      text: erste.comment.trim(),
    });
  }
  return diagnosen
    .toSorted((a, b) => a.datum.localeCompare(b.datum))
    .map((diagnose) => ({ type: "diagnose-gestellt", data: diagnose }));
}

function rechnungEvents(
  invoices: readonly LegacyInvoice[],
  activitiesByInvoice: ReadonlyMap<number, readonly LegacyActivity[]>,
  leistungIdOf: ReadonlyMap<number, string>,
  praxisDerRechnung: (invoice: LegacyInvoice) => string,
  createId: () => string,
): DomainEvent[] {
  return sortByDate(invoices).flatMap((invoice) => {
    const rechnungId = createId();
    const leistungen = sortByDate(
      activitiesByInvoice.get(invoice.id) ?? [],
    ).flatMap((activity) => leistungIdOf.get(activity.id) ?? []);
    const events: DomainEvent[] = [
      {
        type: "rechnung-erstellt",
        data: {
          rechnungId,
          praxiskuerzel: praxisDerRechnung(invoice),
          patientennummer: invoice.customerId,
          diagnosetext: invoice.comment.trim(),
          rechnungstext: decodeHtmlEntities(invoice.invoiceNote).trim(),
          leistungen,
        },
      },
    ];
    // Unfinished Rechnungen of an older version of the legacy application
    // have no credit note flag.
    const entwurf = invoice.creditNote === null && invoice.cleared === 0;
    if (entwurf) {
      return events;
    }
    events.push({
      type: "rechnung-versendet",
      data: {
        rechnungId,
        patientennummer: invoice.customerId,
        rechnungsnummer: invoice.invoiceNumber.trim(),
        datum: invoice.date.trim(),
      },
    });
    // The paid flag was not maintained for long, but a cash payment is noted
    // in the Rechnungstext.
    const bezahlt =
      invoice.cleared === 1 || invoice.invoiceNote.includes("dankend erhalten");
    if (bezahlt) {
      events.push({ type: "rechnung-bezahlt", data: { rechnungId } });
    }
    return events;
  });
}

function euroOf(amount: LegacyAmount): Euro {
  const betrag =
    typeof amount === "number"
      ? amount
      : Number((amount ?? "").trim().replace(",", "."));
  return { cents: Number.isFinite(betrag) ? Math.round(betrag * 100) : 0 };
}

function decodeHtmlEntities(text: string): string {
  return text.replaceAll(/&#(\d+);/g, (_, code: string) =>
    String.fromCodePoint(Number(code)),
  );
}

function fruehestesDatum(
  rows: readonly Readonly<{ date: string }>[] = [],
): string {
  return (
    rows
      .map((row) => row.date.trim())
      .filter((date) => date !== "")
      .toSorted()[0] ?? ""
  );
}

// Sorts by date with undated rows last, then by id.
function sortByDate<T extends Readonly<{ date: string; id: number }>>(
  rows: readonly T[],
): T[];
function sortByDate<T>(
  rows: readonly T[],
  dateOf: (row: T) => string,
  idOf: (row: T) => number,
): T[];
function sortByDate<T>(
  rows: readonly T[],
  dateOf: (row: T) => string = (row) =>
    (row as Readonly<{ date: string }>).date.trim(),
  idOf: (row: T) => number = (row) => (row as Readonly<{ id: number }>).id,
): T[] {
  return rows.toSorted((a, b) => {
    const dateA = dateOf(a);
    const dateB = dateOf(b);
    if (dateA !== dateB) {
      if (dateA === "") {
        return 1;
      }
      if (dateB === "") {
        return -1;
      }
      return dateA.localeCompare(dateB);
    }
    return idOf(a) - idOf(b);
  });
}

function groupBy<T, K>(rows: readonly T[], keyOf: (row: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>();
  for (const row of rows) {
    const key = keyOf(row);
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }
  return groups;
}

// Leaves out properties without a value, so that optional properties are
// missing instead of empty.
function ohneLeere<T extends Record<string, unknown>>(object: T): T {
  return Object.fromEntries(
    Object.entries(object).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  ) as T;
}
