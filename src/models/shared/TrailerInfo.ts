import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface TrailerInfoShape extends Record<string, unknown> {
  available?: boolean;
  url?: string;
  durationMs?: number;
}

export class TrailerInfo {
  declare readonly available?: boolean;
  declare readonly url?: string;
  declare readonly durationMs?: number;

  constructor(shape: TrailerInfoShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends TrailerInfo>(
    this: new (shape: TrailerInfoShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
