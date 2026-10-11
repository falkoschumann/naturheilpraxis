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
- [x] **Funktionalität** Daten der bisherigen RDBMS-Anwendung übernehmen (Schema
      im Abschnitt „Migration“ von `docs/README.md`). Nicht Teil des MVP.
- [x] **Effizienz** Die App startet mit den migrierten Daten (ca. 72.000 Events)
      in wenigen Sekunden. Bisher kopieren `behandlungsansicht`,
      `abrechnungsansicht` und `rechnungsansicht` bei jedem Event ihr ganzes
      Read Model, sodass der Start quadratisch mit der Zahl der Events wächst.
- [x] **Leistung** Im Behandlungsverlauf den Rechnungsstatus jeder Leistung
      anzeigen und „Bearbeiten“ sowie „Löschen“ sperren, wenn die Rechnung es
      nicht erlaubt, wie im Prototyp. Erfordert, dass `behandlungen-ermitteln`
      den Rechnungsstatus je Leistung liefert.
- [x] **Rechnung** Auf der Abrechnungsseite Kennzahlen-Kacheln, die Liste
      „Patienten mit nicht abgerechneten Leistungen“ und eine Betragsspalte in
      der Rechnungsliste ergänzen, wie im Prototyp. Erfordert neue Queries im
      Modell.
- [x] **Patient** In der Patientenliste die Spalte „Offene Leistungen“ mit
      Anzahl und Summe ergänzen, wie im Prototyp. Erfordert, dass
      `patienten-ermitteln` die nicht abgerechneten Leistungen liefert.
- [x] **Zuverlässigkeit** Neben dem Standardablauf weitere Domain Stories in
      `stories` für Alternativabläufe und Fehlerfälle erstellen und als
      E2E-Tests umsetzen, etwa Stammdaten korrigieren, Diagnosen und Leistungen
      ändern und löschen, Rechnungsentwurf ändern und verwerfen, Versand und
      Zahlung zurücknehmen sowie abgelehnte Aktionen wie ein vergebenes
      Praxiskürzel oder der Versand ohne Anschrift. Steigt dadurch die Abdeckung
      von Main-Prozess und Preload, die Schwelle in
      `apps/desktop/e2e/coverage.ts` (derzeit 70 %) anheben.
- [x] **Funktionalität** Speicherort der Datenbank mit dem Event Store
      auswählen. Beim ersten Öffnen der App fragt sie den Speicherort ab, danach
      öffnet sie den zuletzt verwendeten. Nach dem Start kann der Nutzer einen
      anderen Speicherort auswählen.
- [x] **Sicherheit** Das Fenster der App härten: Content Security Policy in
      `index.html`, Navigation und neue Fenster sperren und in den IPC-Handlern
      nur Nachrichten aus dem Hauptframe des eigenen Fensters annehmen.
- [x] **Sicherheit** Die App über ein eigenes Protokoll wie
      `app://naturheilpraxis/` statt über `file://` laden und die Content
      Security Policy als Header setzen. Danach im paketierten Programm die
      Electron-Fuses setzen (u. a. `runAsNode`,
      `enableNodeOptionsEnvironmentVariable`, `enableNodeCliInspectArguments`,
      ASAR-Integrität, `grantFileProtocolExtraPrivileges`) und mit einem
      Probestart prüfen.
- [x] **Rechnung** Die Rechnung aus einer Vorlage erzeugen statt hart codiert.
      Eine Rechnungsvorlage ist eine einzelne HTML-Datei mit eingebettetem CSS,
      Bildern als eingebettetes SVG oder Data-URI und Mustache-Platzhaltern für
      die dokumentierten Daten der Rechnung. Die Vorlagen liegen in einer
      eigenen Tabelle der Datenbankdatei, nicht im Event Store, mit einer Spalte
      für den Typ der Vorlage, damit später weitere Typen wie Adressetiketten
      dazukommen können. Gesichert wird nur die aktuelle Vorlage. Die App
      liefert eine Standardvorlage mit, die der heutigen Rechnung entspricht.
      Vorschau in einem `iframe` mit `sandbox`, Druck wie bisher als Web-Inhalt
      in einem eigenen Fenster ohne JavaScript, Preload und Netzzugriff. Ein PDF
      entsteht über einen PDF-Drucker. E-Rechnungen und die Ablage versendeter
      Rechnungen gehören nicht dazu.
- [x] **Rechnung** Eine allgemeine Rechnungsvorlage und optional eine eigene
      Rechnungsvorlage je Praxis hinterlegen. Eine Praxis ohne eigene Vorlage
      nutzt die allgemeine, die zu Beginn die mitgelieferte Standardvorlage ist.
      Der Nutzer exportiert eine Vorlage als Datei, ändert sie mit einem Editor
      seiner Wahl und importiert sie wieder. Die Vorschau zeigt das Ergebnis mit
      Beispieldaten. Eine Vorlage lässt sich auf die Standardvorlage
      zurücksetzen.
- [x] **Effizienz** Die Patientensuche liefert bei über 9.000 Patienten das
      Ergebnis ohne spürbare Verzögerung, während der Eingabe bleibt die
      Anwendung bedienbar. Das verkürzt auch die Wartezeiten in den Tests.
      Bisher startet jeder Tastendruck eine Abfrage und die Liste rendert alle
      Treffer auf einmal. Die Tabelle mit `@tanstack/react-table` und
      `@tanstack/react-virtual` virtualisiert darstellen, sodass nur die
      sichtbaren Zeilen gerendert werden. Weitere mögliche Maßnahmen: Abfrage
      verzögert auslösen (Debounce), Suchtext je Patient im Read Model
      vorberechnen.
- [x] **Benutzbarkeit** Kopfzeile der Anwendung und Bedienelemente der Seite
      (Seitentitel mit Aktionen wie „Neu“ und „Bearbeiten“, Suche, Tabellenkopf)
      bleiben beim Scrollen sichtbar, nur der Inhalt darunter scrollt. Gilt für
      alle Seiten, analog zur festen Fußzeile mit „Änderungen verwerfen“ und
      „Speichern“ in den Stammdaten des Patienten.
- [x] **Benutzbarkeit** Während eine Suche läuft, zeigt die Patientenliste einen
      Ladehinweis, z. B. einen Spinner im Suchfeld, und die Anzahl der Treffer.
- [x] **Praxis** Die Auswahl „Aktuelle Praxis“ in der Kopfzeile zeigt das
      Praxiskürzel statt des Praxisnamens, da die Namen nicht eindeutig sind.
      Ebenso in der Meldung nach dem Wechsel der Praxis.
- [ ] **Patient** In der Patientenansicht die Schlüsselworte des Patienten im
      Kopf neben dem Namen anzeigen, wie in der Patientenliste.
