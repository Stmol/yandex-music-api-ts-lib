import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { normalizeTopLevelKeys } from "../../core/normalize.ts";
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

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseArtists(value: JsonValue | undefined): readonly Artist[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.filter(isJsonObject).map((entry) => Artist.fromJSON(entry));
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
    Object.assign(this, shape);
  }

  static fromJSON<TModel extends Album>(
    this: new (shape: AlbumShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeTopLevelKeys(json) as Record<string, JsonValue>;
    const shape: AlbumShape = { ...normalized };
    const artists = parseArtists(normalized.artists);

    if (artists !== undefined) {
      shape.artists = artists;
    }

    if (isJsonObject(normalized.cover)) {
      shape.cover = Cover.fromJSON(normalized.cover);
    }

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
