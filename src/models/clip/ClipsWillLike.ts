import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Clip } from "./Clip.ts";

export interface ClipsWillLikeShape extends Record<string, unknown> {
  clips?: readonly Clip[];
}

export class ClipsWillLike {
  declare readonly clips?: readonly Clip[];

  constructor(shape: ClipsWillLikeShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ClipsWillLike>(
    this: new (shape: ClipsWillLikeShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: ClipsWillLikeShape = { ...normalized };
    const clips = parseOptionalJsonObjectArray(normalized.clips, "$.clips", (entry) =>
      Clip.fromJSON(entry));

    if (clips !== undefined) shape.clips = clips;

    return new this(shape);
  }
}
