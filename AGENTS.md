# Agent Instructions

## Project Overview

Mit dieser Applikation können Heilpraktiker Leistungen für Patienten erfassen,
um ihnen diese in Rechnung stellen zu können. Es werden mehrere Praxen
unterstützt.

Es gibt eine RDBMS-basierte Anwendung die ersetzt werden soll. Das
Entity-Relationship-Model liegt im Abschnitt „Migration“ von `docs/README.md`
und soll als Basis für die neue Anwendung dienen.

## Build and Test Commands

All necessary commands can be run via `make`.

- `make` runs a full build with all tests and checks. Must be run successfully
  before commit.
- `make check` runs only unit tests and checks. This is triggered as a Claude
  stop hook.
- `make fix` fixes common linting issues and format the code. Should be run
  before `make check`.

## Project Language

Use English for all files with the exception of the domain. The domain language
is German. Idiomatic code conventions like `create` prefix or `Repository`
suffix stay in English.

## Architecture

The repository is a monorepo with Bun workspaces, compatible with NPM
workspaces:

- `apps` contains applications to be delivered.
- `packages` contains libraries and shared configuration.

## Commits

Use the scopes `desktop` for the app and `model` for the ESDM model.
