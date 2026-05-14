import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface LicenceTextPartShape extends Record<string, unknown> {
  text?: string;
  url?: string;
}

export class LicenceTextPart {
  declare readonly text?: string;
  declare readonly url?: string;

  constructor(shape: LicenceTextPartShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends LicenceTextPart>(
    this: new (shape: LicenceTextPartShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
