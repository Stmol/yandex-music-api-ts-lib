import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Playlist } from "../playlist/Playlist.ts";
import { Day } from "./Day.ts";
import { Event } from "./Event.ts";

export interface FeedShape extends Record<string, unknown> {
  generatedPlaylists?: readonly Playlist[];
  playlists?: readonly Playlist[];
  days?: readonly Day[];
  events?: readonly Event[];
}

export class Feed {
  declare readonly generatedPlaylists?: readonly Playlist[];
  declare readonly playlists?: readonly Playlist[];
  declare readonly days?: readonly Day[];
  declare readonly events?: readonly Event[];

  constructor(shape: FeedShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Feed>(
    this: new (shape: FeedShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: FeedShape = { ...normalized };
    const generatedPlaylists = parseOptionalJsonObjectArray(
      normalized.generatedPlaylists,
      "$.generatedPlaylists",
      (entry) => Playlist.fromJSON(entry),
    );
    const playlists = parseOptionalJsonObjectArray(normalized.playlists, "$.playlists", (entry) =>
      Playlist.fromJSON(entry));
    const days = parseOptionalJsonObjectArray(normalized.days, "$.days", (entry) =>
      Day.fromJSON(entry));
    const events = parseOptionalJsonObjectArray(normalized.events, "$.events", (entry) =>
      Event.fromJSON(entry));

    if (generatedPlaylists !== undefined) shape.generatedPlaylists = generatedPlaylists;
    if (playlists !== undefined) shape.playlists = playlists;
    if (days !== undefined) shape.days = days;
    if (events !== undefined) shape.events = events;

    return new this(shape);
  }
}
