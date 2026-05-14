import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { SimilarEntityData } from "./SimilarEntityData.ts";

export interface SimilarEntityItemShape extends Record<string, unknown> {
  type?: string;
  data?: SimilarEntityData | null;
}

export class SimilarEntityItem {
  declare readonly type?: string;
  declare readonly data?: SimilarEntityData | null;

  constructor(shape: SimilarEntityItemShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends SimilarEntityItem>(
    this: new (shape: SimilarEntityItemShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: SimilarEntityItemShape = { ...normalized };
    const data = parseOptionalJsonObject(normalized.data, "$.data", (entry) =>
      SimilarEntityData.fromJSON(entry));

    if (data !== undefined) shape.data = data;

    return new this(shape);
  }
}
