import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { WaveAgentEntity } from "./WaveAgentEntity.ts";

export interface WaveAgentShape extends Record<string, unknown> {
  id?: string | number;
  entity?: WaveAgentEntity | null;
}

export class WaveAgent {
  declare readonly id?: string | number;
  declare readonly entity?: WaveAgentEntity | null;

  constructor(shape: WaveAgentShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends WaveAgent>(
    this: new (shape: WaveAgentShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: WaveAgentShape = { ...normalized };
    const entity = parseOptionalJsonObject(normalized.entity, "$.entity", (entry) =>
      WaveAgentEntity.fromJSON(entry));

    if (entity !== undefined) shape.entity = entity;

    return new this(shape);
  }
}
