import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { Album } from "../album/Album.ts";

export interface AlbumEventShape extends Record<string, unknown> {
  album?: Album | null;
}

export class AlbumEvent {
  declare readonly album?: Album | null;

  constructor(shape: AlbumEventShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends AlbumEvent>(
    this: new (shape: AlbumEventShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: AlbumEventShape = { ...normalized };
    const album = parseOptionalJsonObject(normalized.album, "$.album", (entry) =>
      Album.fromJSON(entry));

    if (album !== undefined) shape.album = album;

    return new this(shape);
  }
}
