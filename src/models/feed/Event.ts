import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { AlbumEvent } from "./AlbumEvent.ts";
import { ArtistEvent } from "./ArtistEvent.ts";
import { TrackWithAds } from "./TrackWithAds.ts";

export interface EventShape extends Record<string, unknown> {
  type?: string;
  data?: AlbumEvent | ArtistEvent | TrackWithAds | JsonObject | null;
}

export class Event {
  declare readonly type?: string;
  declare readonly data?: AlbumEvent | ArtistEvent | TrackWithAds | JsonObject | null;

  constructor(shape: EventShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Event>(
    this: new (shape: EventShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: EventShape = { ...normalized };
    const data = parseOptionalJsonObject(normalized.data, "$.data", (entry) => {
      if (normalized.type === "album") return AlbumEvent.fromJSON(entry);
      if (normalized.type === "artist") return ArtistEvent.fromJSON(entry);
      if (normalized.type === "track") return TrackWithAds.fromJSON(entry);

      return entry;
    });

    if (data !== undefined) shape.data = data;

    return new this(shape);
  }
}
