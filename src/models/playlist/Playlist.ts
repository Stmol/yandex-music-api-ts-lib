import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { normalizeTopLevelKeys } from "../../core/normalize.ts";
import { Cover } from "../shared/Cover.ts";
import { TrackShort } from "../shared/TrackShort.ts";

export interface PlaylistOwner {
  uid?: number | string;
  login?: string;
  name?: string;
}

export interface PlaylistShape extends Record<string, unknown> {
  kind?: number | string;
  uid?: number | string;
  title?: string;
  description?: string;
  trackCount?: number;
  durationMs?: number;
  visibility?: string;
  cover?: Cover | null;
  owner?: PlaylistOwner | null;
  tracks?: readonly TrackShort[];
}

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseTracks(value: JsonValue | undefined): readonly TrackShort[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.filter(isJsonObject).map((entry) => TrackShort.fromJSON(entry));
}

export class Playlist {
  declare readonly kind?: number | string;
  declare readonly uid?: number | string;
  declare readonly title?: string;
  declare readonly description?: string;
  declare readonly trackCount?: number;
  declare readonly durationMs?: number;
  declare readonly visibility?: string;
  declare readonly cover?: Cover | null;
  declare readonly owner?: PlaylistOwner | null;
  declare readonly tracks?: readonly TrackShort[];

  constructor(shape: PlaylistShape) {
    Object.assign(this, shape);
  }

  static fromJSON<TModel extends Playlist>(
    this: new (shape: PlaylistShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeTopLevelKeys(json) as Record<string, JsonValue>;
    const shape: PlaylistShape = { ...normalized };
    const tracks = parseTracks(normalized.tracks);

    if (tracks !== undefined) {
      shape.tracks = tracks;
    }

    if (isJsonObject(normalized.cover)) {
      shape.cover = Cover.fromJSON(normalized.cover);
    }

    if (isJsonObject(normalized.owner)) {
      shape.owner = normalizeTopLevelKeys(normalized.owner) as PlaylistOwner;
    }

    return new this(shape);
  }

  get ownerUid(): string | number | null {
    return this.owner?.uid ?? this.uid ?? null;
  }

  getCoverUrl(size?: string): string | null {
    return this.cover?.getUrl(size) ?? null;
  }
}
