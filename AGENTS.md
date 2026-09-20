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

Write tests with pattern "_describe_ what _it_ should do something" in English
or "_describe_ was _it_ sollte etwas tun" in German. Implement tests using the
pattern Arrange-Act-Assert.

## Architecture

- Use Domain Driven Design.
- Implement the functional core, imperative shell pattern with the following
  layers:
  - `entry` creates and orchestrates the other layers
  - `application` orchestrates `domain` and `infrastructure` (object oriented)
  - `domain` implements the domain logic of the core (pure functional)
  - `infrastructure` implements the I/O parts of the shell (object oriented)
  - `ui` implements the user interface parts of the shell (object oriented)
    - `entry` creates and orchestrates the UI layer
    - `components` contains reusable components
    - `layouts` contains reusable layouts built from components
    - `pages` contains pages, each built from a layout and components
  - `shared` optional layer with domain-independent code shared between layers

## Commits

Use Conventional Commits (`<type>[optional scope]: <description>`) with the
types `feat`, `fix`, `refactor`, `test`, `docs`, `build`, `ci` and `ai`, and the
scopes `desktop` for the app and `model` for the ESDM model. Mark a breaking
change with a `BREAKING CHANGE:` footer.
