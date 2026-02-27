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

CREATE TABLE IF NOT EXISTS einstellungen (
    id INTEGER PRIMARY KEY,
    praxen TEXT NOT NULL,
    anreden TEXT NOT NULL,
    familienstaende TEXT NOT NULL,
    schluesselworte TEXT NOT NULL,
    standard_schluesselworte TEXT NOT NULL
);

INSERT INTO
    einstellungen (
        id,
        praxen,
        anreden,
        familienstaende,
        schluesselworte,
        standard_schluesselworte
    )
VALUES
    (
        1,
        '["Naturheilpraxis"]',
        '["Herr", "Frau"]',
        '["ledig", "verheiratet", "getrennt", "geschieden", "verwitwet"]',
        '[]',
        '[]'
    );
