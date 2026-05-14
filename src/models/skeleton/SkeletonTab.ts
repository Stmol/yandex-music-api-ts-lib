import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { SkeletonBlock } from "./SkeletonBlock.ts";

export interface SkeletonTabShape extends Record<string, unknown> {
  id?: string | number;
  title?: string;
  blocks?: readonly SkeletonBlock[];
}

export class SkeletonTab {
  declare readonly id?: string | number;
  declare readonly title?: string;
  declare readonly blocks?: readonly SkeletonBlock[];

  constructor(shape: SkeletonTabShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends SkeletonTab>(
    this: new (shape: SkeletonTabShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: SkeletonTabShape = { ...normalized };
    const blocks = parseOptionalJsonObjectArray(normalized.blocks, "$.blocks", (entry) =>
      SkeletonBlock.fromJSON(entry));

    if (blocks !== undefined) shape.blocks = blocks;

    return new this(shape);
  }
}
