// Copyright (c) 2026 Falko Schumann. MIT license.

import { describe, expect, it } from "vitest";

import { type ModelDocument, validateScenarios } from "./scenario_validator.ts";

describe("Scenario validator", () => {
  it("should count scenarios and find no problem in a valid model", () => {
    const documents = createModel([
      createAggregateFeature([
        {
          name: "rename",
          given: [{ event: "added", data: { id: "a1", name: "Alpha" } }],
          when: { command: "rename-thing", data: { id: "a1", name: "Beta" } },
          then: { events: [{ event: "renamed", data: { id: "a1" } }] },
        },
        { name: "nothing", given: [] },
      ]),
    ]);

    const validation = validateScenarios(documents);

    expect(validation).toEqual({ scenarioCount: 2, problems: [] });
  });

  describe("Payloads", () => {
    it("should report an unknown field in a given event", () => {
      const documents = createModel([
        createAggregateFeature([
          {
            name: "s1",
            given: [{ event: "renamed", data: { id: "a1", foo: 1 } }],
          },
        ]),
      ]);

      const { problems } = validateScenarios(documents);

      expect(problems).toEqual([
        'thing.feature.esdm.yaml / s1 > given renamed: unknown field "foo"',
      ]);
    });

    it("should report a missing required field in command data", () => {
      const documents = createModel([
        createAggregateFeature([
          { name: "s1", when: { command: "rename-thing", data: { id: "a1" } } },
        ]),
      ]);

      const { problems } = validateScenarios(documents);

      expect(problems).toEqual([
        'thing.feature.esdm.yaml / s1 > when rename-thing: required field "name" missing',
      ]);
    });

    it("should report a wrong type in an expected event", () => {
      const documents = createModel([
        createAggregateFeature([
          {
            name: "s1",
            then: { events: [{ event: "renamed", data: { id: 42 } }] },
          },
        ]),
      ]);

      const { problems } = validateScenarios(documents);

      expect(problems).toEqual([
        "thing.feature.esdm.yaml / s1 > then renamed.id: expected string, found integer",
      ]);
    });

    it("should validate query parameters and result", () => {
      const documents = createModel([
        createReadModelFeature([
          {
            name: "s1",
            when: { query: "get-thing", parameters: { id: "a1", foo: 1 } },
            then: { result: { thing: { id: "a1", state: "flying" } } },
          },
        ]),
      ]);

      const { problems } = validateScenarios(documents);

      expect(problems).toEqual([
        'things-view.feature.esdm.yaml / s1 > when get-thing: unknown field "foo"',
        'things-view.feature.esdm.yaml / s1 > then result.thing.state: value "flying" is not one of ["on","off"]',
      ]);
    });

    it("should skip the result when the scenario expects none", () => {
      const documents = createModel([
        createReadModelFeature([
          {
            name: "s1",
            when: { query: "get-thing", parameters: { id: "a1" } },
            then: { result: null },
          },
        ]),
      ]);

      const { problems } = validateScenarios(documents);

      expect(problems).toEqual([]);
    });

    it("should validate the expected read model", () => {
      const documents = createModel([
        createReadModelFeature([
          { name: "s1", given: [], then: { readModel: { things: {} } } },
        ]),
      ]);

      const { problems } = validateScenarios(documents);

      expect(problems).toEqual([
        "things-view.feature.esdm.yaml / s1 > then readModel.things: expected array, found object",
      ]);
    });

    it("should validate the items of an array", () => {
      const documents = createModel([
        createReadModelFeature([
          {
            name: "s1",
            then: { readModel: { things: [{ id: "a1", state: "on" }, {}] } },
          },
        ]),
      ]);

      const { problems } = validateScenarios(documents);

      expect(problems).toEqual([
        'things-view.feature.esdm.yaml / s1 > then readModel.things[1]: required field "id" missing',
      ]);
    });

    it("should allow unknown fields when additional properties are allowed", () => {
      const documents = createModel([
        createAggregateFeature([
          {
            name: "s1",
            given: [{ event: "added", data: { id: "a1", color: "red" } }],
          },
        ]),
      ]);

      const { problems } = validateScenarios(documents);

      expect(problems).toEqual([]);
    });
  });

  describe("Constraints", () => {
    it.each([
      {
        field: "code",
        value: "x1",
        problem: '"x1" does not match pattern ^[A-Z]*$',
      },
      {
        field: "code",
        value: "",
        problem: '"" is shorter than 1 characters',
      },
      { field: "count", value: -1, problem: "-1 is less than 0" },
      { field: "count", value: 1.5, problem: "expected integer, found number" },
      { field: "ratio", value: "1", problem: "expected number, found string" },
      {
        field: "kind",
        value: "other",
        problem: 'value "other" instead of "thing"',
      },
      {
        field: "tags",
        value: [],
        problem: "0 items, at least 1 expected",
      },
    ])(
      "should report $field with value $value",
      ({ field, value, problem }) => {
        const documents = createModel([
          createAggregateFeature([
            {
              name: "s1",
              given: [{ event: "measured", data: { [field]: value } }],
            },
          ]),
        ]);

        const { problems } = validateScenarios(documents);

        expect(problems).toEqual([
          `thing.feature.esdm.yaml / s1 > given measured.${field}: ${problem}`,
        ]);
      },
    );

    it("should accept an integer where a number is expected", () => {
      const documents = createModel([
        createAggregateFeature([
          {
            name: "s1",
            given: [
              {
                event: "measured",
                data: { code: "AB", count: 2, ratio: 3, kind: "thing" },
              },
            ],
          },
        ]),
      ]);

      const { problems } = validateScenarios(documents);

      expect(problems).toEqual([]);
    });
  });

  describe("Schema references", () => {
    it("should resolve a reference to a value object", () => {
      const documents = createModel([
        createAggregateFeature([
          {
            name: "s1",
            given: [{ event: "added", data: { id: "a1", state: "flying" } }],
          },
        ]),
      ]);

      const { problems } = validateScenarios(documents);

      expect(problems).toEqual([
        'thing.feature.esdm.yaml / s1 > given added.state: value "flying" is not one of ["on","off"]',
      ]);
    });

    it("should resolve a reference to the state of an aggregate", () => {
      const documents = createModel([
        createAggregateFeature([
          { name: "s1", given: [{ event: "added", data: { name: "Alpha" } }] },
        ]),
      ]);

      const { problems } = validateScenarios(documents);

      expect(problems).toEqual([
        'thing.feature.esdm.yaml / s1 > given added: required field "id" missing',
      ]);
    });

    it("should resolve a reference to a schema nested in a read model", () => {
      const documents = createModel([
        createReadModelFeature([
          {
            name: "s1",
            when: { query: "get-thing", parameters: { id: "a1" } },
            then: { result: { thing: { id: "a1", foo: 1 } } },
          },
        ]),
      ]);

      const { problems } = validateScenarios(documents);

      expect(problems).toEqual([
        'things-view.feature.esdm.yaml / s1 > then result.thing: unknown field "foo"',
      ]);
    });
  });

  describe("Event references", () => {
    it("should tell apart events of the same name from different aggregates", () => {
      const documents = createModel([
        createReadModelFeature([
          {
            name: "s1",
            given: [
              {
                boundedContext: "shop",
                aggregate: "thing",
                event: "changed",
                data: { id: "a1" },
              },
              {
                boundedContext: "shop",
                aggregate: "settings",
                event: "changed",
                data: { isDark: true },
              },
            ],
          },
        ]),
      ]);

      const { problems } = validateScenarios(documents);

      expect(problems).toEqual([]);
    });

    it("should take the aggregate of a bare event name from the feature", () => {
      const documents = createModel([
        createAggregateFeature([
          { name: "s1", given: [{ event: "changed", data: { isDark: true } }] },
        ]),
      ]);

      const { problems } = validateScenarios(documents);

      expect(problems).toEqual([
        'thing.feature.esdm.yaml / s1 > given changed: required field "id" missing',
        'thing.feature.esdm.yaml / s1 > given changed: unknown field "isDark"',
      ]);
    });

    it("should skip names the model does not declare", () => {
      const documents = createModel([
        createAggregateFeature([
          {
            name: "s1",
            given: [{ event: "exploded", data: { foo: 1 } }],
            when: { command: "explode-thing", data: { foo: 1 } },
            then: { events: [{ event: "vanished", data: { foo: 1 } }] },
          },
        ]),
        createReadModelFeature([
          {
            name: "s2",
            when: { query: "get-nothing", parameters: { foo: 1 } },
          },
        ]),
      ]);

      const { problems } = validateScenarios(documents);

      expect(problems).toEqual([]);
    });
  });
});

const SCOPE = { domain: "shop", boundedContext: "shop" };
const THING_SCOPE = { ...SCOPE, aggregate: "thing" };

function createModel(features: ModelDocument[]): ModelDocument[] {
  return [
    {
      path: "value-objects.esdm.yaml",
      doc: {
        kind: "value-object",
        name: "state",
        scope: SCOPE,
        schema: { $id: "urn:esdm:shop:shop:state", enum: ["on", "off"] },
      },
    },
    {
      path: "thing.esdm.yaml",
      doc: {
        kind: "aggregate",
        name: "thing",
        scope: SCOPE,
        state: {
          $id: "urn:esdm:shop:shop:thing",
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            state: { $ref: "urn:esdm:shop:shop:state" },
          },
          required: ["id"],
          additionalProperties: true,
        },
      },
    },
    {
      path: "thing.esdm.yaml",
      doc: {
        kind: "event",
        name: "added",
        scope: THING_SCOPE,
        data: { $ref: "urn:esdm:shop:shop:thing" },
      },
    },
    {
      path: "thing.esdm.yaml",
      doc: {
        kind: "command",
        name: "rename-thing",
        scope: THING_SCOPE,
        data: {
          type: "object",
          properties: { id: { type: "string" }, name: { type: "string" } },
          required: ["id", "name"],
          additionalProperties: false,
        },
      },
    },
    {
      path: "thing.esdm.yaml",
      doc: {
        kind: "event",
        name: "renamed",
        scope: THING_SCOPE,
        data: {
          type: "object",
          properties: { id: { type: "string" } },
          additionalProperties: false,
        },
      },
    },
    {
      path: "thing.esdm.yaml",
      doc: {
        kind: "event",
        name: "changed",
        scope: THING_SCOPE,
        data: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"],
          additionalProperties: false,
        },
      },
    },
    {
      path: "thing.esdm.yaml",
      doc: {
        kind: "event",
        name: "measured",
        scope: THING_SCOPE,
        data: {
          type: "object",
          properties: {
            code: { type: "string", pattern: "^[A-Z]*$", minLength: 1 },
            count: { type: "integer", minimum: 0 },
            ratio: { type: "number" },
            kind: { type: "string", const: "thing" },
            tags: { type: "array", minItems: 1, items: { type: "string" } },
          },
          additionalProperties: false,
        },
      },
    },
    {
      path: "settings.esdm.yaml",
      doc: {
        kind: "event",
        name: "changed",
        scope: { ...SCOPE, aggregate: "settings" },
        data: {
          type: "object",
          properties: { isDark: { type: "boolean" } },
          required: ["isDark"],
          additionalProperties: false,
        },
      },
    },
    {
      path: "things-view.esdm.yaml",
      doc: {
        kind: "read-model",
        name: "things-view",
        scope: SCOPE,
        schema: {
          type: "object",
          properties: {
            things: {
              type: "array",
              items: {
                $id: "urn:esdm:shop:shop:listed-thing",
                type: "object",
                properties: {
                  id: { type: "string" },
                  state: { $ref: "urn:esdm:shop:shop:state" },
                },
                required: ["id"],
                additionalProperties: false,
              },
            },
          },
        },
      },
    },
    {
      path: "things-view.esdm.yaml",
      doc: {
        kind: "query",
        name: "get-thing",
        scope: SCOPE,
        readModel: "things-view",
        parameters: {
          type: "object",
          properties: { id: { type: "string" } },
          additionalProperties: false,
        },
        result: {
          type: "object",
          properties: { thing: { $ref: "urn:esdm:shop:shop:listed-thing" } },
          additionalProperties: false,
        },
      },
    },
    ...features,
  ];
}

function createAggregateFeature(scenarios: unknown[]): ModelDocument {
  return {
    path: "thing.feature.esdm.yaml",
    doc: { kind: "feature", name: "thing", scope: THING_SCOPE, scenarios },
  };
}

function createReadModelFeature(scenarios: unknown[]): ModelDocument {
  return {
    path: "things-view.feature.esdm.yaml",
    doc: {
      kind: "feature",
      name: "things-view",
      scope: { ...SCOPE, readModel: "things-view" },
      scenarios,
    },
  };
}
