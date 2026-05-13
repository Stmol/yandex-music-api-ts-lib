import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { normalizeTopLevelKeys } from "../../core/normalize.ts";
import { Album } from "../album/Album.ts";
import { Artist } from "../artist/Artist.ts";
import { Pager } from "../shared/Pager.ts";
import { Track } from "../track/Track.ts";
import { Playlist } from "../playlist/Playlist.ts";

export interface SearchBestResultShape {
  type?: string;
  result?: Artist | Album | Track | Playlist | null;
  text?: string;
}

export interface SearchShape extends Record<string, unknown> {
  text?: string;
  noCorrect?: boolean;
  best?: SearchBestResultShape | null;
  artists?: Pager<Artist> | null;
  albums?: Pager<Album> | null;
  tracks?: Pager<Track> | null;
  playlists?: Pager<Playlist> | null;
}

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parsePager<TItem>(
  value: JsonValue | undefined,
  parseItem: (entry: JsonObject) => TItem,
): Pager<TItem> | undefined {
  if (!isJsonObject(value)) {
    return undefined;
  }

  const normalized = normalizeTopLevelKeys(value) as Record<string, JsonValue>;
  const pagerShape: {
    page?: number;
    perPage?: number;
    total?: number;
    count?: number;
    items?: readonly TItem[];
  } = {
    ...normalized,
  };

  if (Array.isArray(normalized.items)) {
    pagerShape.items = normalized.items.filter(isJsonObject).map((entry) => parseItem(entry));
  }

  return new Pager<TItem>(pagerShape);
}

function parseBestResult(value: JsonValue | undefined): SearchBestResultShape | undefined {
  if (!isJsonObject(value)) {
    return undefined;
  }

  const normalized = normalizeTopLevelKeys(value) as Record<string, JsonValue>;
  const shape: SearchBestResultShape = { ...normalized };

  if (!isJsonObject(normalized.result)) {
    return shape;
  }

  switch (normalized.type) {
    case "artist":
      shape.result = Artist.fromJSON(normalized.result);
      break;
    case "album":
      shape.result = Album.fromJSON(normalized.result);
      break;
    case "track":
      shape.result = Track.fromJSON(normalized.result);
      break;
    case "playlist":
      shape.result = Playlist.fromJSON(normalized.result);
      break;
    default:
      break;
  }

  return shape;
}

export class Search {
  declare readonly text?: string;
  declare readonly noCorrect?: boolean;
  declare readonly best?: SearchBestResultShape | null;
  declare readonly artists?: Pager<Artist> | null;
  declare readonly albums?: Pager<Album> | null;
  declare readonly tracks?: Pager<Track> | null;
  declare readonly playlists?: Pager<Playlist> | null;

  constructor(shape: SearchShape) {
    Object.assign(this, shape);
  }

  static fromJSON<TModel extends Search>(
    this: new (shape: SearchShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeTopLevelKeys(json) as Record<string, JsonValue>;
    const shape: SearchShape = { ...normalized };
    const best = parseBestResult(normalized.best);
    const artists = parsePager(normalized.artists, (entry) => Artist.fromJSON(entry));
    const albums = parsePager(normalized.albums, (entry) => Album.fromJSON(entry));
    const tracks = parsePager(normalized.tracks, (entry) => Track.fromJSON(entry));
    const playlists = parsePager(normalized.playlists, (entry) => Playlist.fromJSON(entry));

    if (best !== undefined) {
      shape.best = best;
    }

    if (artists !== undefined) {
      shape.artists = artists;
    }

    if (albums !== undefined) {
      shape.albums = albums;
    }

    if (tracks !== undefined) {
      shape.tracks = tracks;
    }

    if (playlists !== undefined) {
      shape.playlists = playlists;
    }

    return new this(shape);
  }

  get hasResults(): boolean {
    return (this.best?.result ?? null) !== null
      || (this.artists?.items?.length ?? 0) > 0
      || (this.albums?.items?.length ?? 0) > 0
      || (this.tracks?.items?.length ?? 0) > 0
      || (this.playlists?.items?.length ?? 0) > 0;
  }
}
