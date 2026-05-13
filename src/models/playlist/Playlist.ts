import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
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
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Playlist>(
    this: new (shape: PlaylistShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: PlaylistShape = { ...normalized };
    const tracks = parseOptionalJsonObjectArray(normalized.tracks, "$.tracks", (entry) =>
      TrackShort.fromJSON(entry));
    const cover = parseOptionalJsonObject(normalized.cover, "$.cover", (entry) =>
      Cover.fromJSON(entry));
    const owner = parseOptionalJsonObject(normalized.owner, "$.owner", (entry) =>
      normalizeObject(entry) as PlaylistOwner);

    if (tracks !== undefined) {
      shape.tracks = tracks;
    }

    if (cover !== undefined) shape.cover = cover;
    if (owner !== undefined) shape.owner = owner;

    return new this(shape);
  }

  get ownerUid(): string | number | null {
    return this.owner?.uid ?? this.uid ?? null;
  }

  getCoverUrl(size?: string): string | null {
    return this.cover?.getUrl(size) ?? null;
  }
}
