import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { SkeletonBlockData } from "./SkeletonBlockData.ts";

export interface SkeletonBlockShape extends Record<string, unknown> {
  id?: string | number;
  type?: string;
  data?: SkeletonBlockData | null;
}

export class SkeletonBlock {
  declare readonly id?: string | number;
  declare readonly type?: string;
  declare readonly data?: SkeletonBlockData | null;

  constructor(shape: SkeletonBlockShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends SkeletonBlock>(
    this: new (shape: SkeletonBlockShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: SkeletonBlockShape = { ...normalized };
    const data = parseOptionalJsonObject(normalized.data, "$.data", (entry) =>
      SkeletonBlockData.fromJSON(entry));

    if (data !== undefined) shape.data = data;

    return new this(shape);
  }
}
