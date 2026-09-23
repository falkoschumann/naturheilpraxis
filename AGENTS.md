# Agent Instructions

## Project Overview

Mit dieser Applikation können Heilpraktiker Leistungen für Patienten erfassen,
um ihnen diese in Rechnung stellen zu können. Es werden mehrere Praxen
unterstützt.

Es gibt eine RDBMS-basierte Anwendung die ersetzt werden soll. Das
Entity-Relationship-Model liegt in `docs/naturheilpraxis.mmd` und soll als Basis
für die neue Anwendung dienen.

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

## Domain Model

The domain model is written with ESDM. Add or update the model, including its
scenarios, before writing tests and code. The skill `model-domain` holds the
modeling conventions.

## Code Style

The ESDM schema requires names in kebab-case. The source code uses the idiomatic
style like CamelCase in TypeScript. Values like event names in the domain must
not be changed when used as event type in code.

## Architecture

Use the functional core, imperative shell pattern and domain driven design
patterns to implement the domain model. The skill `implement-feature` holds the
workflow and conventions.

## Commits

Use Conventional Commits (`<type>[optional scope]: <description>`) with the
types `feat`, `fix`, `refactor`, `test`, `docs`, `build`, `ci` and `ai`, and the
scopes `desktop` for the app and `model` for the ESDM model. Mark a breaking
change with a `BREAKING CHANGE:` footer.
