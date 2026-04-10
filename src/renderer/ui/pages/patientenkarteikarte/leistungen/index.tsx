// Copyright (c) 2026 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";

import { LeistungenQuery, LeistungenQueryResult } from "../../../../../shared/domain/leistungen_query";
import { useMessageHandler } from "../../../components/message_handler_context";

export type LeistungenContext = {
  patientennummer: number;
};

export function LeistungenComponent() {
  const { patientennummer } = useOutletContext<LeistungenContext>();
  const messageHandler = useMessageHandler();
  const [result, setResult] = useState(LeistungenQueryResult.create());

  useEffect(() => {
    async function runAsync() {
      const result = await messageHandler.sucheLeistungen(LeistungenQuery.create({ patientennummer }));
      setResult(result);
    }

    void runAsync();
  }, [messageHandler, patientennummer]);

  // TODO link to Rechnung
  // TODO use TanStack Table

  return (
    <main className="flex-grow-1 container overflow-y-auto">
      <table className="table">
        <thead className="sticky-top">
          <tr>
            <th scope="col" className="text-nowrap">
              Praxis
            </th>
            <th scope="col" className="text-nowrap">
              Datum
            </th>
            <th scope="col" className="text-nowrap">
              Gebührenziffer
            </th>
            <th scope="col" className="text-nowrap">
              Beschreibung
            </th>
            <th scope="col" className="text-nowrap">
              Einzelpreis
            </th>
            <th scope="col" className="text-nowrap">
              Anzahl
            </th>
            <th scope="col" className="text-nowrap">
              Kommentar
            </th>
            <th scope="col" className="text-nowrap">
              Rechnung
            </th>
          </tr>
        </thead>
        <tbody>
          {result.leistungen.map((leistung) => (
            <tr key={leistung.id}>
              <td>{leistung.praxis}</td>
              <td>{leistung.datum.toLocaleString(undefined, { dateStyle: "medium" })}</td>
              <td>{leistung.gebührenziffer}</td>
              <td>{leistung.beschreibung}</td>
              <td>{leistung.einzelpreis.toString()}</td>
              <td>{leistung.anzahl}</td>
              <td>{leistung.kommentar}</td>
              <td>{leistung.rechnungId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

export default LeistungenComponent;
