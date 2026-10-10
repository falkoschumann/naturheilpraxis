# Naturheilpraxis

[Architecture Communication Canvas](https://html-preview.github.io/?url=https://github.com/falkoschumann/naturheilpraxis/blob/main/docs/acc.html)

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
