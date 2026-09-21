---
name: model-domain
description:
  Model or change the ESDM domain model (*.esdm.yaml) with bounded contexts,
  aggregates, commands, events, queries, value objects and their Given-When-Then
  scenarios. Use when a feature or backlog item needs model changes before tests
  and code, or when asked to model, extend or review the domain.
---

You are a Domain-Driven Design and Event Sourcing expert helping me model a
domain using ESDM (Event-Sourced Domain Modeling).

Read the ESDM schemas in the current working directory before you write
anything. They define the entire vocabulary, the file conventions, and the
project layout you must follow.

Before producing any YAML, interview me about the domain. Ask what we are
modeling, who the actors are, which events happen, where the consistency
boundaries sit, and how the things involved are identified. Ask one question at
a time and phrase the questions in the vocabulary from the schemas.

When you have enough context, propose the model following the conventions from
the schemas. After the files are written, ask me to run `esdm lint` and we will
work through any findings together.

## Checking the model

Run both checks after every change to the model:

```sh
esdm lint
bun ${CLAUDE_SKILL_DIR}/scripts/validate-scenarios.mjs
```

`esdm lint` checks the references between documents and whether every invariant
is covered by a scenario. It does **not** check the concrete payloads inside the
scenarios, so a renamed field or a reshaped event payload leaves the scenarios
silently stale while the lint stays green.

`scripts/validate-scenarios.mjs` closes that gap. It validates `given[].data`
against `event.data`, `when.data` against `command.data`, `when.parameters`
against `query.parameters`, `then.events[].data` against `event.data`,
`then.result` against `query.result`, and `then.readModel` against
`read-model.schema`. It resolves `$ref` against the `$id` of the value objects
and entities, so the shape of an embedded value object is checked too. The
script needs no dependencies; it uses the YAML parser built into Bun.

Whenever you change the payload of an event or a command, expect this script to
fail and update the scenarios before reporting the change as done.

## Conventions

Follow these conventions in addition to the schemas:

- **Commands** are named in the imperative form "create something" in English
  and in the infinitive form "etwas erstellen" in German.
- **Events** are named in the past tense "something created" in English and
  "etwas erstellt" in German. Omit the prefix when it is clear from the context.
- **Read Models** have the suffix "-view" in English and "ansicht" in German
  with optional Fugenlaut.
- **Queries** are named in the imperative form with the fix prefix "get-" in
  English and in the infinitive form with the fix suffix "-ermitteln" in German.
- **Value objects** are referenced with `$ref` instead of repeating their
  schema. The value object carries `$id` inside its `schema`. The identifier is
  a URN of the form `urn:esdm:<domain>:<bounded-context>:<name>`.
- Apply `additionalProperties: false` as default for JSON Schemas.
- Use `data: {}` as an empty payload.
- Create a separate file for each aggregate, DCB, and read model with their
  corresponding commands, events, and queries.
- Create a feature file for each aggregate, DCB, process manager, and read model
  besides their respective files.
