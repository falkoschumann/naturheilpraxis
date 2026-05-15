CREATE TABLE IF NOT EXISTS naturheilpraxis (schema_version INTEGER NOT NULL);

INSERT INTO
    naturheilpraxis (schema_version)
VALUES
    (1);

CREATE TABLE IF NOT EXISTS patienten (
    nummer INTEGER PRIMARY KEY AUTOINCREMENT,
    nachname TEXT,
    vorname TEXT,
    geburtsdatum TEXT,
    annahmejahr INTEGER,
    praxis TEXT,
    anrede TEXT,
    strasse TEXT,
    wohnort TEXT,
    postleitzahl TEXT,
    staat TEXT,
    staatsangehoerigkeit TEXT,
    titel TEXT,
    beruf TEXT,
    telefon TEXT,
    mobil TEXT,
    email TEXT,
    familienstand TEXT,
    partner TEXT,
    eltern TEXT,
    kinder TEXT,
    geschwister TEXT,
    notizen TEXT,
    schluesselworte TEXT
);

CREATE TABLE IF NOT EXISTS leistungen (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES patienten (nummer),
    rechnung_id INTEGER REFERENCES rechnungen (id),
    praxis TEXT NOT NULL,
    datum TEXT NOT NULL,
    gebuehrenziffer TEXT NOT NULL,
    beschreibung TEXT NOT NULL,
    kommentar TEXT,
    einzelpreis NUMERIC NOT NULL,
    anzahl NUMERIC NOT NULL
);

CREATE INDEX IF NOT EXISTS leistungen_patient_id ON leistungen (patient_id);

CREATE INDEX IF NOT EXISTS leistungen_rechnung_id ON leistungen (rechnung_id);

CREATE TABLE IF NOT EXISTS rechnungen (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES patienten (nummer),
    praxis TEXT NOT NULL,
    nummer TEXT NOT NULL UNIQUE,
    datum TEXT NOT NULL,
    rechnungstext TEXT,
    kommentar TEXT,
    zustand TEXT NOT NULL -- enum: erstellt, abgerechnet, bezahlt
);

CREATE INDEX IF NOT EXISTS rechnungen_patient_id ON rechnungen (patient_id);

-- TODO Verlinke eine oder mehrere Diagnosen in Rechnung
CREATE TABLE IF NOT EXISTS rechnungsdiagnosen (
    rechnung_id INTEGER NOT NULL REFERENCES rechnungen (id),
    diagnose_id INTEGER NOT NULL REFERENCES diagnosen (id),
    PRIMARY KEY (rechnung_id, diagnose_id)
);

-- TODO Sollte Diagnose eine Praxis haben?
CREATE TABLE IF NOT EXISTS diagnosen (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL REFERENCES patienten (nummer),
    datum TEXT NOT NULL,
    beschreibung TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS diagnosen_patient_id ON diagnosen (patient_id);

CREATE TABLE IF NOT EXISTS praxen (name TEXT PRIMARY KEY);

INSERT INTO
    praxen (name)
VALUES
    ('Naturheilpraxis')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS anreden (name TEXT PRIMARY KEY);

INSERT INTO
    anreden (name)
VALUES
    ('Frau'),
    ('Herr')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS familienstände (name TEXT PRIMARY KEY);

INSERT INTO
    familienstände (name)
VALUES
    ('ledig'),
    ('verheiratet'),
    ('getrennt'),
    ('geschieden'),
    ('verwitwet')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS schlüsselworte (
    name TEXT PRIMARY KEY,
    standard INTEGER DEFAULT 0 NOT NULL
);

INSERT INTO
    schlüsselworte (name, standard)
VALUES
    ('gesetzlich versichert', 0),
    ('privat versichert', 0),
    ('Selbstzahler', 0),
    ('Geburtstagskarte', 1),
    ('Weihnachtskarte', 1),
    ('E-Mail', 0),
    ('Werbung', 0)
ON CONFLICT DO NOTHING;
