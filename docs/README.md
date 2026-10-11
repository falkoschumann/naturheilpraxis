# Naturheilpraxis

[Architecture Communication Canvas](https://html-preview.github.io/?url=https://github.com/falkoschumann/naturheilpraxis/blob/main/docs/acc.html)

## Rechnungsvorlage

Die App erzeugt eine Rechnung aus einer Rechnungsvorlage. Ohne eigene Vorlage
nutzt sie die mitgelieferte Standardvorlage
`apps/desktop/src/main/ui/rechnungsvorlage.html`.

Eine Rechnungsvorlage ist eine einzelne HTML-Datei. Sie bringt alles mit, was
sie braucht:

- CSS steht in einem `<style>`-Element oder im Attribut `style`.
- Bilder sind eingebettetes SVG oder Data-URIs (`data:image/png;base64,…`),
  Schriften ebenfalls Data-URIs.
- Skripte laufen nicht. Externe Dateien wie Bilder, Schriften oder Stylesheets
  aus dem Netz oder von der Festplatte werden nicht geladen.

Platzhalter folgen [Mustache](https://mustache.github.io/mustache.5.html):

- `{{name}}` setzt einen Wert ein, maskiert für HTML.
- `{{#name}}…{{/name}}` zeigt den Inhalt nur, wenn der Wert vorhanden ist, und
  wiederholt ihn für jedes Element einer Liste. Innerhalb steht `{{.}}` für den
  Wert selbst.
- `{{^name}}…{{/name}}` zeigt den Inhalt nur, wenn der Wert fehlt.
- Mit Punkten wird auf verschachtelte Werte zugegriffen, etwa
  `{{praxis.anschrift.ort}}`.

Datumsangaben und Beträge sind bereits formatiert, etwa `11.10.2026` und
`51,10 €`. Mit _optional_ gekennzeichnete Werte können fehlen.

| Platzhalter                     | Bedeutung                                              |
| ------------------------------- | ------------------------------------------------------ |
| `rechnungsnummer`               | Rechnungsnummer, optional, fehlt beim Entwurf          |
| `rechnungsdatum`                | Rechnungsdatum, optional, fehlt beim Entwurf           |
| `entwurf`                       | wahr, solange die Rechnung ein Entwurf ist             |
| `status`                        | `entwurf`, `versendet` oder `bezahlt`                  |
| `praxis.name`                   | Name der Praxis                                        |
| `praxis.anschrift.strasse`      | Straße und Hausnummer der Praxis                       |
| `praxis.anschrift.zusatz`       | Adresszusatz der Praxis, optional                      |
| `praxis.anschrift.postleitzahl` | Postleitzahl der Praxis                                |
| `praxis.anschrift.ort`          | Ort der Praxis                                         |
| `praxis.anschrift.staat`        | Staat der Praxis, optional                             |
| `praxis.kontakt.telefon`        | Telefon der Praxis, optional                           |
| `praxis.kontakt.mobiltelefon`   | Mobiltelefon der Praxis, optional                      |
| `praxis.kontakt.fax`            | Fax der Praxis, optional                               |
| `praxis.kontakt.email`          | E-Mail der Praxis, optional                            |
| `praxis.kontakt.website`        | Website der Praxis, optional                           |
| `patient.patientennummer`       | Patientennummer                                        |
| `patient.anrede`                | Anrede, optional, etwa „Herr“                          |
| `patient.titel`                 | Titel, optional, etwa „Dr.“                            |
| `patient.vorname`               | Vorname                                                |
| `patient.nachname`              | Nachname                                               |
| `patient.name`                  | Titel, Vorname und Nachname, etwa „Dr. Max Mustermann“ |
| `patient.geburtsdatum`          | Geburtsdatum                                           |
| `patient.anschrift`             | Anschrift des Patienten wie bei der Praxis, optional   |
| `diagnosetext`                  | Diagnose auf der Rechnung                              |
| `rechnungstext`                 | Text unter den Positionen, etwa das Zahlungsziel       |
| `positionen`                    | Liste der Leistungen, aufsteigend nach Datum           |
| `positionen` → `datum`          | Datum der Leistung                                     |
| `positionen` → `ziffer`         | Gebührenziffer                                         |
| `positionen` → `bezeichnung`    | Bezeichnung der Leistung                               |
| `positionen` → `anzahl`         | Anzahl                                                 |
| `positionen` → `einzelbetrag`   | Einzelbetrag                                           |
| `positionen` → `betrag`         | Anzahl mal Einzelbetrag                                |
| `gesamtbetrag`                  | Summe der Beträge aller Positionen                     |

Beispiel für die Positionen:

```html
<table>
  {{#positionen}}
  <tr>
    <td>{{datum}}</td>
    <td>{{bezeichnung}}</td>
    <td>{{betrag}}</td>
  </tr>
  {{/positionen}}
</table>
<p>Rechnungsbetrag: {{gesamtbetrag}}</p>
```

## Migration

### Legacy Datenbankschema

Das folgende Schema dokumentiert die aktuelle SQLite-Datenbank.

```mermaid
---
title: Praxisprogramm
config:
  layout: elk
---
erDiagram
  direction LR

  ACTIVITYLIST }|--|| AGENCYLIST : "agencyid"
  ACTIVITYLIST }|--|| CUSTOMERLIST : "Customerid"
  ACTIVITYLIST }|--|O INVOICELIST : "Invoiceid"
  CUSTOMERLIST }|--|| AGENCYLIST : "agencyid"
  CUSTOMERLIST ||--|O PARTNERFRLIST : "Partnerfrom"
  CUSTOMERLIST ||--|O CHILDFRLIST : "Childfrom"
  HANDLINGDATA }|--|| CUSTOMERLIST : "Customerid"
  HANDLINGDATA }|--|| HANDLINGLIST : "Handlingid"
  INVOICELIST }|--|| CUSTOMERLIST : "Customerid"
  INVOICELIST }|--|| AGENCYLIST : "agencyid"

  DOCUMENTLIST {
    text dokument
    text pfad
  }

  CATEGORIECUSTOMER {
    text kategorie
    text datum
    integer patient
    integer erledigt
  }

  SYSTEM {
    text Praxis
  }

  TITLELIST {
    integer id PK
    text title
  }

  FAMILYSTATUSLIST {
    integer id PK
    text familystatus
  }

  FEELIST {
    text editor
    text edited
    text creator
    text created
    integer id pk
    text shortnote
    text description
    numeric amountdm
    numeric amount
  }

  HANDLINGDATA {
    text created
    text creator
    numeric customerid FK
    text edited
    text editor
    numeric handlingid FK
  }

  ACTIVITYLIST {
    numeric agencyid FK
    numeric feeid FK
    text editor
    text edited
    text created
    text creator
    integer id PK
    numeric invoiceid FK
    text agency
    text date
    text shortnote
    text description
    numeric amountdm
    numeric amount
    numeric quantity
    numeric customerid FK
    numeric abrechnen
    text comment
  }

  INVOICELIST {
    numeric creditnote
    text invoicenumber
    text editor
    text edited
    text created
    text creator
    integer id PK
    numeric agencywherewrite
    text date
    numeric cleared
    numeric customerid FK
    numeric agencyid FK
    numeric amount
    text comment
    text invoicenote
    numeric gen_diagnose
    numeric gen_text
  }

  CUSTOMERLIST {
    numeric agencyid FK
    text mobilephone
    numeric childfrom FK
    numeric partnerfrom FK
    text edited
    text editor
    text created
    text creator
    text dayofbirth
    integer id PK
    numeric acceptance
    text agency
    text title
    text academictitle
    text forename
    text surname
    numeric geburtstag
    numeric geburtsmonat
    numeric geburtsjahr
    text street
    text streetnumber
    text city
    text postalcode
    text country
    text citizenship
    text callnumber
    text email
    text familystatus
    text occupation
    text memorandum
    numeric kind
    numeric verzogen
    numeric exitus
    numeric unbekannt
    numeric geburtstagskarte
    numeric weihnachtskarte
    numeric auswahl
  }

  AGENCYLIST {
    numeric ordernumber
    text agency
    integer id PK
  }

  HANDLINGLIST {
    numeric standard
    text handling
    integer id PK
  }

  TEMPLATELIST {
    text templatefile
    text variables
    text query
    text comment
    text orderby
    text permithandlinglist
    text forbidhandlinglist
    text auxiliarycolumns
    text filter
    numeric agencyid
    text filename
    integer id PK
    text name
    numeric ordernumber
    text type
  }
```

### Schema der Zieldatenbank

Das folgende Schema beschreibt das Ziel als Basis für das Domain Model.

```mermaid
---
title: Naturheilpraxis
config:
  layout: elk
---
erDiagram
  direction LR

  PATIENT }o--|| PRAXIS : "wird aufgenommen in"
  PATIENT |o--o| PATIENT : "ist Partner von"
  PATIENT }o--o| PATIENT : "ist Kind von"
  PATIENT ||--o{ DIAGNOSE : "erhält"
  DIAGNOSE }o--|| PRAXIS : "ist gestellt in"
  PATIENT ||--o{ LEISTUNG : "bekommt"
  LEISTUNG }o--|| PRAXIS : "ist erbracht in"
  LEISTUNG |o..|| GEBUEHR : "basiert auf"
  PATIENT ||--o{ RECHNUNG : "muss bezahlen"
  RECHNUNG |o--|| DIAGNOSE : "bezieht sich auf"
  RECHNUNG |o--|{ LEISTUNG : "beinhaltet"
  RECHNUNG }o--|| PRAXIS : "wird ausgestellt in"

  PRAXIS {
      string kuerzel PK
      string name
      string strasse
      string zusatz
      string postleitzahl
      string ort
      string staat
      string telefon
      string mobiltelefon
      string email
      string website
      string rechnungstext
  }

  GEBUEHR {
      string ziffer PK
      string bezeichnung
      number betrag
  }

  PATIENT {
      number nummer PK
      string praxiskuerzel FK
      string annahmejahr
      string geburtsdatum
      string anrede
      string titel
      string vorname
      string nachname
      string strasse
      string zusatz
      string postleitzahl
      string ort
      string staat
      string telefon
      string mobiltelefon
      string email
      string beruf
      string familienstand
      string staatsangehoerigkeit
      string notizen
      number partner_von_id FK
      number kind_von_id FK
      string[] schluesselworte
  }

  DIAGNOSE {
      number diagnose_id PK
      string praxiskuerzel FK
      number patient_id FK
      string datum
      string text
  }

  LEISTUNG {
      number leistung_id PK
      string praxiskuerzel FK
      number patient_id FK
      number rechnung_id FK
      string datum
      string ziffer
      string bezeichnung
      number anzahl
      number einzelbetrag
  }

  RECHNUNG {
      number rechnung_id PK
      string praxiskuerzel FK
      number patient_id FK
      number diagnose_id FK
      string nummer UK
      string datum
      string text
      string status
  }
```
