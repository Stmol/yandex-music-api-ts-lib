import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface UserShape extends Record<string, unknown> {
  uid?: number | string;
  login?: string;
  name?: string;
  displayName?: string;
}

export class User {
  declare readonly uid?: number | string;
  declare readonly login?: string;
  declare readonly name?: string;
  declare readonly displayName?: string;

  constructor(shape: UserShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends User>(
    this: new (shape: UserShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
