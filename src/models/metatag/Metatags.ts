import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Metatag } from "./Metatag.ts";

export interface MetatagsShape extends Record<string, unknown> {
  metatags?: readonly Metatag[];
}

export class Metatags {
  declare readonly metatags?: readonly Metatag[];

  constructor(shape: MetatagsShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Metatags>(
    this: new (shape: MetatagsShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: MetatagsShape = { ...normalized };
    const metatags = parseOptionalJsonObjectArray(normalized.metatags, "$.metatags", (entry) =>
      Metatag.fromJSON(entry));

    if (metatags !== undefined) shape.metatags = metatags;

    return new this(shape);
  }
}
