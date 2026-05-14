import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { PlayContext } from "./PlayContext.ts";

export interface PlayContextsDataShape extends Record<string, unknown> {
  items?: readonly PlayContext[];
  contexts?: readonly PlayContext[];
  playContexts?: readonly PlayContext[];
}

export class PlayContextsData {
  declare readonly items?: readonly PlayContext[];
  declare readonly contexts?: readonly PlayContext[];
  declare readonly playContexts?: readonly PlayContext[];

  constructor(shape: PlayContextsDataShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends PlayContextsData>(
    this: new (shape: PlayContextsDataShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: PlayContextsDataShape = { ...normalized };
    const items = parseOptionalJsonObjectArray(normalized.items, "$.items", (entry) =>
      PlayContext.fromJSON(entry));
    const contexts = parseOptionalJsonObjectArray(normalized.contexts, "$.contexts", (entry) =>
      PlayContext.fromJSON(entry));
    const playContexts = parseOptionalJsonObjectArray(normalized.playContexts, "$.playContexts", (entry) =>
      PlayContext.fromJSON(entry));

    if (items !== undefined) shape.items = items;
    if (contexts !== undefined) shape.contexts = contexts;
    if (playContexts !== undefined) shape.playContexts = playContexts;

    return new this(shape);
  }
}
