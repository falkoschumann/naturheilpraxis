// Copyright (c) 2026 Falko Schumann. MIT license.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  CoverageReport,
  type CoverageReportOptions,
  type CoverageResults,
} from "monocart-coverage-reports";

// The coverage of the end-to-end tests is measured only on demand, see the
// script "test:e2e:coverage".
export const coverageEnabled = process.env["E2E_COVERAGE"] !== undefined;

const appDirectory = fileURLToPath(new URL("..", import.meta.url));

const outputDirectory = path.join(appDirectory, "coverage-e2e");

// The main process writes its coverage on exit into this directory, next to
// the other output of Playwright.
export const mainCoverageDirectory = path.join(
  appDirectory,
  "node_modules/.cache/e2e-coverage",
);

// Only the end-to-end tests run the code of the main process and the preload,
// which wires the app together. Its line coverage must not fall below this
// percentage, so that for example a new IPC channel is not left untested.
const minimumLineCoverageOfMainProcess = 85;

// Only the built code of the app counts, mapped back to its sources.
const options: CoverageReportOptions = {
  name: "Coverage of the end-to-end tests",
  outputDir: outputDirectory,
  reports: ["console-summary", "html", "lcovonly"],
  entryFilter: (entry) => entry.url.includes("/build/"),
  sourceFilter: (sourcePath) => sourcePath.includes("src/"),
};

export function createCoverageReport(): CoverageReport {
  return new CoverageReport(options);
}

export async function globalSetup(): Promise<void> {
  if (!coverageEnabled) {
    return;
  }
  await fs.rm(outputDirectory, { recursive: true, force: true });
  await fs.rm(mainCoverageDirectory, { recursive: true, force: true });
  createCoverageReport().cleanCache();
}

export async function globalTeardown(): Promise<void> {
  if (!coverageEnabled) {
    return;
  }
  const report = createCoverageReport();
  await report.addFromDir(mainCoverageDirectory);
  const results = await report.generate();
  checkMainProcessCoverage(results);
}

function checkMainProcessCoverage(results: CoverageResults | undefined): void {
  const files = (results?.files ?? []).filter(
    (file) =>
      file.sourcePath.startsWith("src/main/") ||
      file.sourcePath.startsWith("src/preload/"),
  );
  const covered = files.reduce(
    (sum, file) => sum + file.summary.lines.covered,
    0,
  );
  const total = files.reduce((sum, file) => sum + file.summary.lines.total, 0);
  const percentage = total === 0 ? 0 : (100 * covered) / total;
  console.log(
    `Line coverage of main process and preload: ${percentage.toFixed(2)} % (minimum ${minimumLineCoverageOfMainProcess} %)`,
  );
  if (percentage < minimumLineCoverageOfMainProcess) {
    throw new Error(
      `The line coverage of main process and preload is ${percentage.toFixed(2)} %, below the minimum of ${minimumLineCoverageOfMainProcess} %. Add an end-to-end test that runs the uncovered code, see coverage-e2e/index.html.`,
    );
  }
}
