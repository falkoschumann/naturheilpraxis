// Copyright (c) 2026 Falko Schumann. MIT license.

import { useEffect, useId, useState } from "react";
import { Link } from "react-router";

import type { NaturheilpraxisApi } from "../../../../shared/application/naturheilpraxis-api.ts";
import type {
  Behandlung,
  BehandlungenErmittelnQueryResult,
  Leistungsrechnung,
} from "../../../../shared/domain/behandlungsansicht.ts";
import type { Diagnose, Leistung } from "../../../../shared/domain/entities.ts";
import { formatEuro, type Patientennummer } from "../../../../shared/domain/value-objects.ts";
import { RechnungsstatusBadge } from "../../components/rechnungen-tabelle.tsx";
import { ListHeader } from "../../components/sticky-header.tsx";

// What can be done with the entries of the treatment.
export type BehandlungAktionen = Readonly<{
  onDiagnoseBearbeiten: (diagnose: Diagnose) => void;
  onDiagnoseLoeschen: (diagnose: Diagnose) => void;
  onLeistungBearbeiten: (leistung: Leistung) => void;
  onLeistungLoeschen: (leistung: Leistung) => void;
}>;

// The tab Behandlung of the Karteikarte: the course of the treatment, grouped
// by day, the newest first.
export function PatientBehandlung({
  api,
  patientennummer,
  stand,
  aktionen,
}: {
  api: NaturheilpraxisApi;
  patientennummer: Patientennummer;
  // A change loads the treatment again.
  stand: number;
  aktionen: BehandlungAktionen;
}) {
  const [behandlungen, setBehandlungen] = useState<BehandlungenErmittelnQueryResult>();
  const [fehler, setFehler] = useState<string>();

  useEffect(() => {
    let aktuell = true;
    api.behandlungenErmitteln({ type: "behandlungen-ermitteln", parameters: { patientennummer } }).then(
      (behandlungen) => {
        if (aktuell) {
          setBehandlungen(behandlungen);
        }
      },
      () => {
        if (aktuell) {
          setFehler("Die Behandlung konnte nicht geladen werden. Bitte starten Sie die Anwendung neu.");
        }
      },
    );
    return () => {
      aktuell = false;
    };
  }, [api, patientennummer, stand]);

  if (fehler !== undefined) {
    return (
      <div className="alert alert-danger" role="alert">
        {fehler}
      </div>
    );
  }
  if (behandlungen === undefined) {
    return (
      <p className="text-body-secondary" role="status">
        <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
        Die Behandlung wird geladen …
      </p>
    );
  }
  if (behandlungen.length === 0) {
    return (
      <div className="text-center text-body-secondary border rounded bg-body p-5">
        Für diesen Patienten wurde noch nichts erfasst. Beginnen Sie mit <em>Diagnose stellen</em> oder{" "}
        <em>Leistung erfassen</em>.
      </div>
    );
  }

  const tage = Map.groupBy(behandlungen, (behandlung) => behandlung.eintrag.datum);
  return (
    <>
      <h2 className="h5 mb-3">Behandlungsverlauf</h2>
      {[...tage].map(([datum, eintraege]) => (
        <Tag key={datum} datum={datum} eintraege={eintraege} aktionen={aktionen} />
      ))}
    </>
  );
}

function Tag({
  datum,
  eintraege,
  aktionen,
}: {
  datum: string;
  eintraege: readonly Behandlung[];
  aktionen: BehandlungAktionen;
}) {
  const titleId = useId();
  const leistungen = eintraege.flatMap((behandlung) => (behandlung.art === "leistung" ? [behandlung.eintrag] : []));
  return (
    <section className="card shadow-sm mb-3" aria-labelledby={titleId}>
      <ListHeader className="card-header d-flex justify-content-between">
        <h3 id={titleId} className="h6 mb-0">
          {datumLang(datum)}
        </h3>
        {leistungen.length > 0 && (
          <span className="small text-body-secondary">
            Summe {formatEuro({ cents: leistungen.reduce((summe, leistung) => summe + betragsSumme(leistung), 0) })}
          </span>
        )}
      </ListHeader>
      <ul className="list-group list-group-flush">
        {eintraege.map((behandlung) =>
          behandlung.art === "diagnose" ? (
            <DiagnoseEintrag key={behandlung.eintrag.diagnoseId} diagnose={behandlung.eintrag} aktionen={aktionen} />
          ) : (
            <LeistungEintrag
              key={behandlung.eintrag.leistungId}
              leistung={behandlung.eintrag}
              rechnung={behandlung.rechnung}
              aktionen={aktionen}
            />
          ),
        )}
      </ul>
    </section>
  );
}

function DiagnoseEintrag({ diagnose, aktionen }: { diagnose: Diagnose; aktionen: BehandlungAktionen }) {
  return (
    <li className="list-group-item d-flex gap-3 align-items-start">
      <span className="badge bg-info-subtle text-info-emphasis p-2">
        <i className="fa-solid fa-stethoscope" aria-hidden="true"></i>
      </span>
      <div className="me-auto">
        <div className="small text-body-secondary">
          Diagnose <PraxisBadge praxiskuerzel={diagnose.praxiskuerzel} />
        </div>
        <div className="fw-semibold">{diagnose.text}</div>
      </div>
      <Aktionen
        name="Diagnose"
        onBearbeiten={() => aktionen.onDiagnoseBearbeiten(diagnose)}
        onLoeschen={() => aktionen.onDiagnoseLoeschen(diagnose)}
      />
    </li>
  );
}

// A Leistung can be changed as long as its Rechnung is a draft and deleted only
// without a Rechnung.
function LeistungEintrag({
  leistung,
  rechnung,
  aktionen,
}: {
  leistung: Leistung;
  rechnung?: Leistungsrechnung;
  aktionen: BehandlungAktionen;
}) {
  return (
    <li className="list-group-item d-flex gap-3 align-items-start">
      <span className="badge bg-primary-subtle text-primary-emphasis p-2">
        <i className="fa-solid fa-hand-holding-medical" aria-hidden="true"></i>
      </span>
      <div className="me-auto">
        <div className="small text-body-secondary">
          Leistung · Ziffer {leistung.ziffer} <PraxisBadge praxiskuerzel={leistung.praxiskuerzel} />{" "}
          {rechnung === undefined ? (
            <span className="badge text-bg-warning">Offen</span>
          ) : (
            <>
              <RechnungsstatusBadge rechnungsstatus={rechnung.status} />{" "}
              <Link to={`/rechnungen/${rechnung.rechnungId}`} className="ms-1">
                {rechnung.rechnungsnummer === undefined ? "Rechnungsentwurf" : `Rechnung ${rechnung.rechnungsnummer}`}
              </Link>
            </>
          )}
        </div>
        <div>{leistung.bezeichnung}</div>
      </div>
      <div className="text-end text-nowrap">
        <div className="fw-semibold">{formatEuro({ cents: betragsSumme(leistung) })}</div>
        <div className="small text-body-secondary">
          {leistung.anzahl} × {formatEuro(leistung.einzelbetrag)}
        </div>
      </div>
      <Aktionen
        name="Leistung"
        bearbeitenGesperrt={
          rechnung !== undefined && rechnung.status !== "entwurf"
            ? "Leistungen in versendeten oder bezahlten Rechnungen können nicht geändert werden."
            : undefined
        }
        loeschenGesperrt={
          rechnung === undefined
            ? undefined
            : "Leistungen in einer Rechnung können nicht gelöscht werden. Entfernen Sie die Leistung zuerst aus dem Rechnungsentwurf."
        }
        onBearbeiten={() => aktionen.onLeistungBearbeiten(leistung)}
        onLoeschen={() => aktionen.onLeistungLoeschen(leistung)}
      />
    </li>
  );
}

// A locked action is disabled and its title says why.
function Aktionen({
  name,
  bearbeitenGesperrt,
  loeschenGesperrt,
  onBearbeiten,
  onLoeschen,
}: {
  name: string;
  bearbeitenGesperrt?: string | undefined;
  loeschenGesperrt?: string | undefined;
  onBearbeiten: () => void;
  onLoeschen: () => void;
}) {
  return (
    <div className="btn-group btn-group-sm">
      <button
        type="button"
        className="btn btn-outline-secondary"
        aria-label={`${name} bearbeiten`}
        title={bearbeitenGesperrt ?? "Bearbeiten"}
        disabled={bearbeitenGesperrt !== undefined}
        onClick={onBearbeiten}
      >
        <i className="fa-solid fa-pen" aria-hidden="true"></i>
      </button>
      <button
        type="button"
        className="btn btn-outline-danger"
        aria-label={`${name} löschen`}
        title={loeschenGesperrt ?? "Löschen"}
        disabled={loeschenGesperrt !== undefined}
        onClick={onLoeschen}
      >
        <i className="fa-solid fa-trash" aria-hidden="true"></i>
      </button>
    </div>
  );
}

function PraxisBadge({ praxiskuerzel }: { praxiskuerzel: string }) {
  return (
    <span className="badge rounded-pill bg-primary-subtle text-primary-emphasis border border-primary-subtle">
      {praxiskuerzel}
    </span>
  );
}

function betragsSumme(leistung: Leistung): number {
  return leistung.anzahl * leistung.einzelbetrag.cents;
}

// Like "Montag, 14. September 2026".
function datumLang(isoDatum: string): string {
  return new Date(`${isoDatum}T00:00:00`).toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
