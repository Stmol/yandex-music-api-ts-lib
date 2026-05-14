import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { SimilarEntityItem } from "./SimilarEntityItem.ts";

export interface WaveShape extends Record<string, unknown> {
  id?: string | number;
  title?: string;
  items?: readonly SimilarEntityItem[];
}

export class Wave {
  declare readonly id?: string | number;
  declare readonly title?: string;
  declare readonly items?: readonly SimilarEntityItem[];

  constructor(shape: WaveShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Wave>(
    this: new (shape: WaveShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: WaveShape = { ...normalized };
    const items = parseOptionalJsonObjectArray(normalized.items, "$.items", (entry) =>
      SimilarEntityItem.fromJSON(entry));

    if (items !== undefined) shape.items = items;

    return new this(shape);
  }
}
