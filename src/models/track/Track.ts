import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { normalizeTopLevelKeys } from "../../core/normalize.ts";
import { Album } from "../album/Album.ts";
import { Artist } from "../artist/Artist.ts";
import { Cover } from "../shared/Cover.ts";
import type { TrackShortShape } from "../shared/TrackShort.ts";

export interface TrackShape extends Record<string, unknown>, TrackShortShape {
  artists?: readonly Artist[];
  albums?: readonly Album[];
  cover?: Cover | null;
  lyricsAvailable?: boolean;
  major?: MajorShape | null;
}

export interface MajorShape {
  id?: number | string;
  name?: string;
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

function parseAlbums(value: JsonValue | undefined): readonly Album[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.filter(isJsonObject).map((entry) => Album.fromJSON(entry));
}

export class Track {
  declare readonly id?: string | number;
  declare readonly realId?: string | number;
  declare readonly title?: string;
  declare readonly version?: string | null;
  declare readonly durationMs?: number;
  declare readonly available?: boolean;
  declare readonly coverUri?: string | null;
  declare readonly contentWarning?: string | null;
  declare readonly artists?: readonly Artist[];
  declare readonly albums?: readonly Album[];
  declare readonly cover?: Cover | null;
  declare readonly lyricsAvailable?: boolean;
  declare readonly major?: MajorShape | null;

  constructor(shape: TrackShape) {
    Object.assign(this, shape);
  }

  static fromJSON<TModel extends Track>(
    this: new (shape: TrackShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeTopLevelKeys(json) as Record<string, JsonValue>;
    const shape: TrackShape = { ...normalized };
    const artists = parseArtists(normalized.artists);
    const albums = parseAlbums(normalized.albums);

    if (artists !== undefined) {
      shape.artists = artists;
    }

    if (albums !== undefined) {
      shape.albums = albums;
    }

    if (isJsonObject(normalized.cover)) {
      shape.cover = Cover.fromJSON(normalized.cover);
    }

    if (isJsonObject(normalized.major)) {
      shape.major = normalizeTopLevelKeys(normalized.major) as MajorShape;
    }

    return new this(shape);
  }

  get displayTitle(): string | null {
    if (typeof this.title !== "string" || this.title.length === 0) {
      return null;
    }

    if (typeof this.version !== "string" || this.version.length === 0) {
      return this.title;
    }

    return `${this.title} (${this.version})`;
  }

  get durationSeconds(): number | null {
    return typeof this.durationMs === "number" ? Math.floor(this.durationMs / 1000) : null;
  }

  get artistsNames(): readonly string[] {
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
