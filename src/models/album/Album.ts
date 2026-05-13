import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Artist } from "../artist/Artist.ts";
import { Cover } from "../shared/Cover.ts";

export interface AlbumShape extends Record<string, unknown> {
  id?: string | number;
  title?: string;
  type?: string;
  metaType?: string;
  year?: number;
  releaseDate?: string;
  genre?: string;
  trackCount?: number;
  coverUri?: string | null;
  artists?: readonly Artist[];
  cover?: Cover | null;
}

export class Album {
  declare readonly id?: string | number;
  declare readonly title?: string;
  declare readonly type?: string;
  declare readonly metaType?: string;
  declare readonly year?: number;
  declare readonly releaseDate?: string;
  declare readonly genre?: string;
  declare readonly trackCount?: number;
  declare readonly coverUri?: string | null;
  declare readonly artists?: readonly Artist[];
  declare readonly cover?: Cover | null;

  constructor(shape: AlbumShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Album>(
    this: new (shape: AlbumShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: AlbumShape = { ...normalized };
    const artists = parseOptionalJsonObjectArray(normalized.artists, "$.artists", (entry) =>
      Artist.fromJSON(entry));
    const cover = parseOptionalJsonObject(normalized.cover, "$.cover", (entry) =>
      Cover.fromJSON(entry));

    if (artists !== undefined) {
      shape.artists = artists;
    }
    if (cover !== undefined) shape.cover = cover;

    return new this(shape);
  }

  get artistNames(): readonly string[] {
    return (this.artists ?? [])
      .map((artist) => artist.displayName)
      .filter((value): value is string => value !== null);
  }

  getCoverUrl(size?: string): string | null {
    if (this.cover !== undefined && this.cover !== null) {
      return this.cover.getUrl(size);
    }

    if (typeof this.coverUri !== "string" || this.coverUri.length === 0) {
      return null;
    }

    return new Cover({ uri: this.coverUri }).getUrl(size);
  }
}
