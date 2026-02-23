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
    annahmejahr INTEGER NOT NULL,
    praxis TEXT NOT NULL,
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
    kinder TEXT,
    notizen TEXT,
    schluesselworte TEXT
);
