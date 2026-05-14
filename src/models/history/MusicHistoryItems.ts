import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { Album } from "../album/Album.ts";
import { Artist } from "../artist/Artist.ts";
import { Playlist } from "../playlist/Playlist.ts";
import { Track } from "../track/Track.ts";

export interface MusicHistoryItemIdShape extends Record<string, unknown> {
  id?: string | number;
  trackId?: string | number;
  albumId?: string | number;
  uid?: string | number;
  kind?: string | number;
  seeds?: readonly string[];
}

export interface MusicHistoryItemDataShape extends Record<string, unknown> {
  itemId?: MusicHistoryItemIdShape | null;
  fullModel?: Album | Artist | Playlist | Track | JsonObject | null;
}

export interface MusicHistoryItemShape extends Record<string, unknown> {
  type?: string;
  data?: MusicHistoryItemDataShape | null;
}

export interface MusicHistoryItemsShape extends Record<string, unknown> {
  items?: readonly MusicHistoryItemShape[];
}

function parseFullModel(
  type: string | undefined,
  value: JsonValue | undefined,
): Album | Artist | Playlist | Track | JsonObject | null | undefined {
  const model = parseOptionalJsonObject(value, "$.fullModel", (entry) => entry);

  if (model === undefined || model === null) {
    return model;
  }

  if (type === "track") return Track.fromJSON(model);
  if (type === "album") return Album.fromJSON(model);
  if (type === "artist") return Artist.fromJSON(model);
  if (type === "playlist") return Playlist.fromJSON(model);

  return model;
}

function parseItemData(
  value: JsonValue | undefined,
  type: string | undefined,
  path: string,
): MusicHistoryItemDataShape | null | undefined {
  return parseOptionalJsonObject(value, path, (entry) => {
    const normalized = normalizeObject(entry) as Record<string, JsonValue>;
    const shape: MusicHistoryItemDataShape = { ...normalized };
    const itemId = parseOptionalJsonObject(normalized.itemId, `${path}.itemId`, (itemIdEntry) =>
      normalizeObject(itemIdEntry) as MusicHistoryItemIdShape);
    const fullModel = parseFullModel(type, normalized.fullModel);

    if (itemId !== undefined) shape.itemId = itemId;
    if (fullModel !== undefined) shape.fullModel = fullModel;

    return shape;
  });
}

export class MusicHistoryItems {
  declare readonly items?: readonly MusicHistoryItemShape[];

  constructor(shape: MusicHistoryItemsShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends MusicHistoryItems>(
    this: new (shape: MusicHistoryItemsShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: MusicHistoryItemsShape = { ...normalized };
    const items = parseOptionalJsonObjectArray(normalized.items, "$.items", (entry, path) => {
      const item = normalizeObject(entry) as Record<string, JsonValue>;
      const itemShape: MusicHistoryItemShape = { ...item };
      const type = typeof item.type === "string" ? item.type : undefined;
      const data = parseItemData(item.data, type, `${path}.data`);

      if (data !== undefined) itemShape.data = data;

      return itemShape;
    });

    if (items !== undefined) {
      shape.items = items;
    }

    return new this(shape);
  }
}
