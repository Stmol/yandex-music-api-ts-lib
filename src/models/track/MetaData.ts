import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface MetaDataShape extends Record<string, unknown> {
  album?: string;
  artist?: string;
  title?: string;
  number?: number;
  genre?: string;
  year?: number;
}

export class MetaData {
  declare readonly album?: string;
  declare readonly artist?: string;
  declare readonly title?: string;
  declare readonly number?: number;
  declare readonly genre?: string;
  declare readonly year?: number;

  constructor(shape: MetaDataShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends MetaData>(
    this: new (shape: MetaDataShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json) as MetaDataShape);
  }
}
