#!/usr/bin/env bun

// Prueft die konkreten Nutzdaten der Given-When-Then-Szenarien gegen die Schemas,
// die das Modell dafuer vorsieht:
//
//   given[].data       gegen event.data
//   when.data          gegen command.data
//   when.parameters    gegen query.parameters
//   then.events[].data gegen event.data
//   then.result        gegen query.result
//   then.readModel     gegen read-model.schema
//
// `esdm lint` prueft die Verweise zwischen den Dokumenten, aber nicht die Nutzdaten.
// Wird ein Ereignis umgebaut, bleiben die Szenarien deshalb still veraltet zurueck.
//
// Aufruf: bun .claude/skills/model-domain/validate-scenarios.mjs [verzeichnis]

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.argv[2] ?? ".";
const SKIP = new Set(["node_modules", "schemas", ".git", "build", "dist"]);

function findModelFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) found.push(...findModelFiles(path));
    else if (entry.endsWith(".esdm.yaml")) found.push(path);
  }
  return found.sort();
}

function parseDocuments(path) {
  const parsed = Bun.YAML.parse(readFileSync(path, "utf8"));
  // Bun liefert fuer Dateien mit mehreren Dokumenten ein Array, sonst das Dokument
  // selbst. ESDM-Dokumente sind immer Mappings, ein Array ist deshalb eindeutig.
  const documents = Array.isArray(parsed) ? parsed : [parsed];
  return documents.filter((doc) => doc && typeof doc === "object");
}

const files = findModelFiles(root);
const events = new Map();
const commands = new Map();
const queries = new Map();
const readModels = new Map();
const valueObjects = new Map(); // $id -> Schema, zum Aufloesen von $ref
const features = [];

for (const path of files) {
  for (const doc of parseDocuments(path)) {
    switch (doc.kind) {
      case "event":
        events.set(doc.name, doc.data);
        break;
      case "command":
        commands.set(doc.name, doc.data);
        break;
      case "query":
        queries.set(doc.name, doc);
        break;
      case "read-model":
        readModels.set(doc.name, doc.schema);
        break;
      case "value-object":
      case "entity":
        if (doc.schema?.$id) valueObjects.set(doc.schema.$id, doc.schema);
        break;
      case "feature":
        features.push({ path: relative(root, path), doc });
        break;
    }
  }
}

const problems = [];

function resolve(schema) {
  if (schema?.$ref && valueObjects.has(schema.$ref))
    return valueObjects.get(schema.$ref);
  return schema;
}

function typeOf(value) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  if (Number.isInteger(value)) return "integer";
  return typeof value;
}

function typeMatches(expected, value) {
  const actual = typeOf(value);
  if (expected === "number") return actual === "number" || actual === "integer";
  if (expected === "integer") return actual === "integer";
  return actual === expected;
}

function validate(where, rawSchema, value) {
  const schema = resolve(rawSchema);
  if (!schema || typeof schema !== "object") return;
  if (value === undefined) return;

  const report = (message) => problems.push(`${where}: ${message}`);

  if (schema.type && !typeMatches(schema.type, value)) {
    report(`erwartet ${schema.type}, gefunden ${typeOf(value)}`);
    return;
  }
  if (schema.enum && !schema.enum.includes(value)) {
    report(
      `Wert ${JSON.stringify(value)} steht nicht in ${JSON.stringify(schema.enum)}`,
    );
  }
  if (schema.const !== undefined && value !== schema.const) {
    report(
      `Wert ${JSON.stringify(value)} statt ${JSON.stringify(schema.const)}`,
    );
  }
  if (typeof value === "string") {
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      report(`"${value}" passt nicht zum Muster ${schema.pattern}`);
    }
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      report(`"${value}" ist kuerzer als ${schema.minLength} Zeichen`);
    }
  }
  if (
    typeof value === "number" &&
    schema.minimum !== undefined &&
    value < schema.minimum
  ) {
    report(`${value} ist kleiner als ${schema.minimum}`);
  }

  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      report(
        `${value.length} Eintraege, mindestens ${schema.minItems} erwartet`,
      );
    }
    if (schema.items) {
      value.forEach((item, index) =>
        validate(`${where}[${index}]`, schema.items, item),
      );
    }
    return;
  }

  if (typeOf(value) !== "object") return;

  const properties = schema.properties ?? {};
  for (const required of schema.required ?? []) {
    if (!(required in value)) report(`Pflichtfeld "${required}" fehlt`);
  }
  for (const [key, entry] of Object.entries(value)) {
    if (key in properties) validate(`${where}.${key}`, properties[key], entry);
    else if (schema.additionalProperties === false)
      report(`unbekanntes Feld "${key}"`);
  }
}

for (const { path, doc } of features) {
  for (const scenario of doc.scenarios ?? []) {
    const at = `${path} / ${scenario.name}`;

    for (const given of scenario.given ?? []) {
      if (!given.event) continue;
      if (!events.has(given.event)) {
        problems.push(
          `${at}: given nennt unbekanntes Ereignis "${given.event}"`,
        );
        continue;
      }
      validate(
        `${at} > given ${given.event}`,
        events.get(given.event),
        given.data,
      );
    }

    const when = scenario.when ?? {};
    if (when.command) {
      if (!commands.has(when.command)) {
        problems.push(
          `${at}: when nennt unbekanntes Command "${when.command}"`,
        );
      } else {
        validate(
          `${at} > when ${when.command}`,
          commands.get(when.command),
          when.data,
        );
      }
    }
    if (when.query) {
      if (!queries.has(when.query)) {
        problems.push(`${at}: when nennt unbekannte Abfrage "${when.query}"`);
      } else {
        const query = queries.get(when.query);
        validate(
          `${at} > when ${when.query}`,
          query.parameters,
          when.parameters,
        );
        if (
          scenario.then?.result !== undefined &&
          scenario.then.result !== null
        ) {
          validate(`${at} > then result`, query.result, scenario.then.result);
        }
      }
    }

    for (const expected of scenario.then?.events ?? []) {
      if (!events.has(expected.event)) {
        problems.push(
          `${at}: then nennt unbekanntes Ereignis "${expected.event}"`,
        );
        continue;
      }
      validate(
        `${at} > then ${expected.event}`,
        events.get(expected.event),
        expected.data,
      );
    }

    if (scenario.then?.readModel !== undefined && doc.scope?.readModel) {
      validate(
        `${at} > then readModel`,
        readModels.get(doc.scope.readModel),
        scenario.then.readModel,
      );
    }
  }
}

if (problems.length === 0) {
  const count = features.reduce(
    (sum, f) => sum + (f.doc.scenarios?.length ?? 0),
    0,
  );
  console.log(
    `${count} Szenarien geprueft, alle Nutzdaten passen zu ihren Schemas.`,
  );
} else {
  for (const problem of problems) console.error(problem);
  console.error(`\n${problems.length} Abweichungen gefunden.`);
  process.exit(1);
}
