import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { normalizeTopLevelKeys } from "../../core/normalize.ts";

export interface LandingEntityShape {
  type?: string;
  data?: JsonValue;
}

export interface LandingBlockShape {
  id?: string;
  type?: string;
  title?: string;
  entities?: readonly LandingEntityShape[];
}

export interface LandingShape extends Record<string, unknown> {
  blocks?: readonly LandingBlockShape[];
}

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseEntities(value: JsonValue | undefined): readonly LandingEntityShape[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value
    .filter(isJsonObject)
    .map((entry) => normalizeTopLevelKeys(entry) as LandingEntityShape);
}

function parseBlocks(value: JsonValue | undefined): readonly LandingBlockShape[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value
    .filter(isJsonObject)
    .map((entry) => {
      const normalized = normalizeTopLevelKeys(entry) as Record<string, JsonValue>;
      const block: LandingBlockShape = { ...normalized };
      const entities = parseEntities(normalized.entities);

      if (entities !== undefined) {
        block.entities = entities;
      }

      return block;
    });
}

export class Landing {
  declare readonly blocks?: readonly LandingBlockShape[];

  constructor(shape: LandingShape) {
    Object.assign(this, shape);
  }

  static fromJSON<TModel extends Landing>(
    this: new (shape: LandingShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeTopLevelKeys(json) as Record<string, JsonValue>;
    const shape: LandingShape = { ...normalized };
    const blocks = parseBlocks(normalized.blocks);

    if (blocks !== undefined) {
      shape.blocks = blocks;
    }

    return new this(shape);
  }

  get blockCount(): number {
    return this.blocks?.length ?? 0;
  }

  findBlock(type: string): LandingBlockShape | undefined {
    return this.blocks?.find((block) => block.type === type);
  }
}
