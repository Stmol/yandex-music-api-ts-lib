import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { expectJsonObject, normalizeObject } from "../../core/parsing.ts";
import { Album } from "../album/Album.ts";
import { Artist } from "../artist/Artist.ts";
import { Playlist } from "../playlist/Playlist.ts";
import { Track } from "../track/Track.ts";

export interface BlockEntityShape extends Record<string, unknown> {
  type?: string;
  data?: Album | Artist | Playlist | Track | JsonObject | null;
}

export class BlockEntity {
  declare readonly type?: string;
  declare readonly data?: Album | Artist | Playlist | Track | JsonObject | null;

  constructor(shape: BlockEntityShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends BlockEntity>(
    this: new (shape: BlockEntityShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: BlockEntityShape = { ...normalized };

    if (normalized.data !== undefined && normalized.data !== null) {
      const data = expectJsonObject(normalized.data, "$.data");

      switch (normalized.type) {
        case "album":
          shape.data = Album.fromJSON(data);
          break;
        case "artist":
          shape.data = Artist.fromJSON(data);
          break;
        case "playlist":
          shape.data = Playlist.fromJSON(data);
          break;
        case "track":
          shape.data = Track.fromJSON(data);
          break;
        default:
          shape.data = data;
          break;
      }
    }

    return new this(shape);
  }
}
