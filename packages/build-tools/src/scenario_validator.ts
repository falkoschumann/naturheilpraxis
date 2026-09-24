// Copyright (c) 2026 Falko Schumann. MIT license.

// Validates the payloads of the Given-When-Then scenarios of an ESDM model
// against the schemas of the events, commands, queries and read models they
// name. `esdm lint` checks the names, so unknown names are skipped here.

export interface ModelDocument {
  readonly path: string;
  readonly doc: unknown;
}

export interface ScenarioValidation {
  readonly scenarioCount: number;
  readonly problems: readonly string[];
}

interface JsonSchema {
  readonly $id?: string;
  readonly $ref?: string;
  readonly type?: string;
  readonly enum?: readonly unknown[];
  readonly const?: unknown;
  readonly pattern?: string;
  readonly minLength?: number;
  readonly minimum?: number;
  readonly minItems?: number;
  readonly items?: JsonSchema;
  readonly properties?: Readonly<Record<string, JsonSchema>>;
  readonly required?: readonly string[];
  readonly additionalProperties?: boolean | JsonSchema;
}

interface Scope {
  readonly boundedContext?: string;
  readonly aggregate?: string;
  readonly readModel?: string;
}

interface EventReference {
  readonly boundedContext?: string;
  readonly aggregate?: string;
  readonly event?: string;
  readonly data?: unknown;
}

interface Scenario {
  readonly name?: string;
  readonly given?: readonly EventReference[];
  readonly when?: {
    readonly command?: string;
    readonly data?: unknown;
    readonly query?: string;
    readonly parameters?: unknown;
  };
  readonly then?: {
    readonly events?: readonly EventReference[];
    readonly result?: unknown;
    readonly readModel?: unknown;
  };
}

interface EsdmDocument {
  readonly kind?: string;
  readonly name?: string;
  readonly scope?: Scope;
  readonly data?: JsonSchema;
  readonly parameters?: JsonSchema;
  readonly result?: JsonSchema;
  readonly schema?: JsonSchema;
  readonly scenarios?: readonly Scenario[];
}

export function validateScenarios(
  documents: readonly ModelDocument[],
): ScenarioValidation {
  const events = new Map<string, JsonSchema | undefined>();
  const commands = new Map<string, JsonSchema | undefined>();
  const queries = new Map<string, EsdmDocument>();
  const readModels = new Map<string, JsonSchema | undefined>();
  const schemasById = new Map<string, JsonSchema>();
  const features: { path: string; doc: EsdmDocument }[] = [];

  // A $id can be anywhere, also in the state of an aggregate or nested in the
  // schema of a read model.
  function collectSchemaIds(node: unknown) {
    if (Array.isArray(node)) {
      node.forEach(collectSchemaIds);
      return;
    }
    if (!isObject(node)) return;
    const schema = node as JsonSchema;
    if (typeof schema.$id === "string") schemasById.set(schema.$id, schema);
    Object.values(node).forEach(collectSchemaIds);
  }

  for (const { path, doc: value } of documents) {
    if (!isObject(value)) continue;
    const doc = value as EsdmDocument;
    if (doc.kind !== "feature") collectSchemaIds(doc);
    switch (doc.kind) {
      case "event":
        events.set(
          eventKey({ ...doc.scope, event: doc.name }, doc.scope),
          doc.data,
        );
        break;
      case "command":
        commands.set(doc.name ?? "", doc.data);
        break;
      case "query":
        queries.set(doc.name ?? "", doc);
        break;
      case "read-model":
        readModels.set(doc.name ?? "", doc.schema);
        break;
      case "feature":
        features.push({ path, doc });
        break;
    }
  }

  const problems: string[] = [];

  function resolve(schema: JsonSchema | undefined) {
    if (schema?.$ref && schemasById.has(schema.$ref)) {
      return schemasById.get(schema.$ref);
    }
    return schema;
  }

  function validate(
    where: string,
    rawSchema: JsonSchema | undefined,
    value: unknown,
  ) {
    const schema = resolve(rawSchema);
    if (schema == null || typeof schema !== "object") return;
    if (value === undefined) return;

    const report = (message: string) => problems.push(`${where}: ${message}`);

    if (schema.type && !typeMatches(schema.type, value)) {
      report(`expected ${schema.type}, found ${typeOf(value)}`);
      return;
    }
    if (schema.enum && !schema.enum.includes(value)) {
      report(
        `value ${JSON.stringify(value)} is not one of ${JSON.stringify(schema.enum)}`,
      );
    }
    if (schema.const !== undefined && value !== schema.const) {
      report(
        `value ${JSON.stringify(value)} instead of ${JSON.stringify(schema.const)}`,
      );
    }
    if (typeof value === "string") {
      if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
        report(`"${value}" does not match pattern ${schema.pattern}`);
      }
      if (schema.minLength !== undefined && value.length < schema.minLength) {
        report(`"${value}" is shorter than ${schema.minLength} characters`);
      }
    }
    if (
      typeof value === "number" &&
      schema.minimum !== undefined &&
      value < schema.minimum
    ) {
      report(`${value} is less than ${schema.minimum}`);
    }

    if (Array.isArray(value)) {
      if (schema.minItems !== undefined && value.length < schema.minItems) {
        report(`${value.length} items, at least ${schema.minItems} expected`);
      }
      const items = schema.items;
      if (items) {
        value.forEach((item, index) => {
          validate(`${where}[${index}]`, items, item);
        });
      }
      return;
    }

    if (!isObject(value)) return;

    const properties = schema.properties ?? {};
    for (const required of schema.required ?? []) {
      if (!(required in value)) report(`required field "${required}" missing`);
    }
    for (const [key, entry] of Object.entries(value)) {
      if (key in properties) {
        validate(`${where}.${key}`, properties[key], entry);
      } else if (schema.additionalProperties === false) {
        report(`unknown field "${key}"`);
      }
    }
  }

  for (const { path, doc } of features) {
    for (const scenario of doc.scenarios ?? []) {
      const at = `${path} / ${scenario.name}`;

      for (const given of scenario.given ?? []) {
        const key = eventKey(given, doc.scope);
        if (!events.has(key)) continue;
        validate(`${at} > given ${given.event}`, events.get(key), given.data);
      }

      const when = scenario.when ?? {};
      if (when.command !== undefined && commands.has(when.command)) {
        validate(
          `${at} > when ${when.command}`,
          commands.get(when.command),
          when.data,
        );
      }
      const query =
        when.query === undefined ? undefined : queries.get(when.query);
      if (query) {
        validate(
          `${at} > when ${when.query}`,
          query.parameters,
          when.parameters,
        );
        if (scenario.then?.result != null) {
          validate(`${at} > then result`, query.result, scenario.then.result);
        }
      }

      for (const expected of scenario.then?.events ?? []) {
        const key = eventKey(expected, doc.scope);
        if (!events.has(key)) continue;
        validate(
          `${at} > then ${expected.event}`,
          events.get(key),
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

  const scenarioCount = features.reduce(
    (sum, feature) => sum + (feature.doc.scenarios?.length ?? 0),
    0,
  );
  return { scenarioCount, problems };
}

// Events are unique only per aggregate, `changed` may exist several times.
// Aggregate features name events without scope, all other features with a full
// reference.
function eventKey(reference: EventReference, featureScope: Scope = {}) {
  const { boundedContext, aggregate } = reference.boundedContext
    ? reference
    : featureScope;
  return `${boundedContext}/${aggregate ?? ""}/${reference.event}`;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function typeOf(value: unknown) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  if (Number.isInteger(value)) return "integer";
  return typeof value;
}

function typeMatches(expected: string, value: unknown) {
  const actual = typeOf(value);
  if (expected === "number") return actual === "number" || actual === "integer";
  return actual === expected;
}
