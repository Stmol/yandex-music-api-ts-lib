import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { CaseForms } from "./CaseForms.ts";
import { User } from "./User.ts";

export interface MadeForShape extends Record<string, unknown> {
  user?: User | null;
  caseForms?: CaseForms | null;
}

export class MadeFor {
  declare readonly user?: User | null;
  declare readonly caseForms?: CaseForms | null;

  constructor(shape: MadeForShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends MadeFor>(
    this: new (shape: MadeForShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: MadeForShape = { ...normalized };
    const user = parseOptionalJsonObject(normalized.user, "$.user", (entry) =>
      User.fromJSON(entry));
    const caseForms = parseOptionalJsonObject(normalized.caseForms, "$.caseForms", (entry) =>
      CaseForms.fromJSON(entry));

    if (user !== undefined) shape.user = user;
    if (caseForms !== undefined) shape.caseForms = caseForms;

    return new this(shape);
  }
}
