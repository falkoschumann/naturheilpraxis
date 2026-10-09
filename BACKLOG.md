# Backlog

Offene und erledigte Aufgaben. Die Reihenfolge entspricht der Priorität: Weiter
oben bedeutet wichtiger.

Jeder Eintrag beginnt mit einer Kategorie:

```markdown
- [ ] **Kategorie** Beschreibung
```

**Kategorien:** fachliche Themen wie `Praxis`, `Patient`, `Diagnose`,
`Leistung`, `Gebühr`, `Rechnung` oder Qualitäten wie `Funktionalität`,
`Benutzbarkeit`, `Zuverlässigkeit`, `Effizienz`, `Änderbarkeit`, `Sicherheit`
(FURPS+).

## Aufgaben

- [x] **Praxis** Praxis anlegen und Praxisdaten ändern (`praxisverwaltung`)
      sowie Praxen anzeigen (`praxenansicht`) als erster Durchstich durch alle
      Schichten: Domain, Event Store in SQLite, IPC, UI und E2E-Schritt
      „Heilpraktiker legt Praxis an“.
- [x] **Gebühr** Gebührenverzeichnis pflegen (`gebuehrenverzeichnis`) und
      Gebühren anzeigen (`gebuehrenansicht`).
- [x] **Patient** Patient aufnehmen (`patientenaufnahme`), Patientendaten ändern
      (`patientenkartei`) und Patienten anzeigen (`patientenansicht`) mit
      E2E-Schritt „Heilpraktiker legt Patientenkarteikarte für Patient an“.
- [x] **Diagnose** Diagnose stellen, ändern und löschen (`diagnosestellung`)
      sowie Diagnosen anzeigen (`behandlungsansicht`) mit E2E-Schritt
      „Heilpraktiker stellt Diagnose für Patient“.
- [x] **Leistung** Leistung erbringen, ändern und löschen
      (`leistungserbringung`) sowie Behandlungen anzeigen (`behandlungsansicht`)
      mit E2E-Schritt „Heilpraktiker erbringt Leistung für Patient“.
- [x] **Rechnung** Rechnung aus nicht abgerechneten Leistungen erstellen, ändern
      und Entwurf löschen (`abrechnung`) sowie Abrechnungen und Rechnung
      anzeigen (`abrechnungsansicht`, `rechnungsansicht`) mit E2E-Schritt
      „Heilpraktiker erstellt Rechnung aus Leistung wegen Diagnose“.
- [x] **Rechnung** Rechnung versenden und Versand zurücknehmen (`abrechnung`)
      mit E2E-Schritt „Heilpraktiker versendet Rechnung an Patient“.
- [x] **Rechnung** Zahlung erfassen (`abrechnung`) mit E2E-Schritt „Patient
      bezahlt Rechnung“.
- [ ] **Funktionalität** Daten der bisherigen RDBMS-Anwendung übernehmen (Schema
      im Abschnitt „Migration“ von `docs/README.md`). Nicht Teil des MVP.
- [ ] **Leistung** Im Behandlungsverlauf den Rechnungsstatus jeder Leistung
      anzeigen und „Bearbeiten“ sowie „Löschen“ sperren, wenn die Rechnung es
      nicht erlaubt, wie im Prototyp. Erfordert, dass `behandlungen-ermitteln`
      den Rechnungsstatus je Leistung liefert.
- [ ] **Rechnung** Auf der Abrechnungsseite Kennzahlen-Kacheln, die Liste
      „Patienten mit nicht abgerechneten Leistungen“ und eine Betragsspalte in
      der Rechnungsliste ergänzen, wie im Prototyp. Erfordert neue Queries im
      Modell.
- [ ] **Patient** In der Patientenliste die Spalte „Offene Leistungen“ mit
      Anzahl und Summe ergänzen, wie im Prototyp. Erfordert, dass
      `patienten-ermitteln` die nicht abgerechneten Leistungen liefert.
