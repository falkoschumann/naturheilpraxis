#!/usr/bin/env bun

// Copyright (c) 2026 Falko Schumann. MIT license.

// Validates the scenario payloads of the ESDM model in the given directory,
// the current directory by default. It complements `esdm lint`, which does not
// check the payloads.

import fs from "node:fs";
import path from "node:path";

import { type ModelDocument, validateScenarios } from "./scenario_validator.ts";

const SKIP = new Set(["node_modules", "schemas", ".git", "build", "dist"]);

const root = process.argv[2] ?? ".";
const documents = findModelFiles(root).flatMap((file) =>
  parseDocuments(file).map((doc): ModelDocument => ({
    path: path.relative(root, file),
    doc,
  })),
);
const { scenarioCount, problems } = validateScenarios(documents);

if (problems.length === 0) {
  console.log(`${scenarioCount} scenarios checked, all payloads match.`);
} else {
  for (const problem of problems) console.error(problem);
  console.error(`\n${problems.length} problems found.`);
  process.exit(1);
}

function findModelFiles(dir: string): string[] {
  const found: string[] = [];
  for (const entry of fs.readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const file = path.join(dir, entry);
    if (fs.statSync(file).isDirectory()) found.push(...findModelFiles(file));
    else if (entry.endsWith(".esdm.yaml")) found.push(file);
  }
  return found.sort();
}

function parseDocuments(file: string): unknown[] {
  const parsed: unknown = Bun.YAML.parse(fs.readFileSync(file, "utf8"));
  // Bun returns an array for a file with several documents, otherwise the
  // document itself. ESDM documents are always mappings, so an array is
  // unambiguous.
  return Array.isArray(parsed) ? parsed : [parsed];
}
