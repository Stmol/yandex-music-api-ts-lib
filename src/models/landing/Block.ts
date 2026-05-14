import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { BlockEntity } from "./BlockEntity.ts";

export interface BlockShape extends Record<string, unknown> {
  type?: string;
  title?: string;
  entities?: readonly BlockEntity[];
}

export class Block {
  declare readonly type?: string;
  declare readonly title?: string;
  declare readonly entities?: readonly BlockEntity[];

  constructor(shape: BlockShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Block>(
    this: new (shape: BlockShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: BlockShape = { ...normalized };
    const entities = parseOptionalJsonObjectArray(normalized.entities, "$.entities", (entry) =>
      BlockEntity.fromJSON(entry));

    if (entities !== undefined) shape.entities = entities;

    return new this(shape);
  }
}
