import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Credit } from "./Credit.ts";

export interface CreditsShape extends Record<string, unknown> {
  credits?: readonly Credit[];
}

export class Credits {
  declare readonly credits?: readonly Credit[];

  constructor(shape: CreditsShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Credits>(
    this: new (shape: CreditsShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: CreditsShape = { ...normalized };
    const credits = parseOptionalJsonObjectArray(normalized.credits, "$.credits", (entry) =>
      Credit.fromJSON(entry));

    if (credits !== undefined) shape.credits = credits;

    return new this(shape);
  }
}
