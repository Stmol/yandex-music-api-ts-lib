import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { Playlist } from "../playlist/Playlist.ts";

export interface GeneratedPlaylistShape extends Record<string, unknown> {
  playlist?: Playlist | null;
}

export class GeneratedPlaylist {
  declare readonly playlist?: Playlist | null;

  constructor(shape: GeneratedPlaylistShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends GeneratedPlaylist>(
    this: new (shape: GeneratedPlaylistShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: GeneratedPlaylistShape = { ...normalized };
    const playlist = parseOptionalJsonObject(normalized.playlist, "$.playlist", (entry) =>
      Playlist.fromJSON(entry));

    if (playlist !== undefined) shape.playlist = playlist;

    return new this(shape);
  }
}
