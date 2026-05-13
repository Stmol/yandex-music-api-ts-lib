import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { normalizeTopLevelKeys } from "../../core/normalize.ts";
import { Cover } from "../shared/Cover.ts";

export interface StationIdShape {
  type?: string;
  tag?: string;
}

export interface StationShape extends Record<string, unknown> {
  id?: StationIdShape | null;
  name?: string;
  icon?: Cover | null;
}

function isJsonObject(value: JsonValue | undefined): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class Station {
  declare readonly id?: StationIdShape | null;
  declare readonly name?: string;
  declare readonly icon?: Cover | null;

  constructor(shape: StationShape) {
    Object.assign(this, shape);
  }

  static fromJSON<TModel extends Station>(
    this: new (shape: StationShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeTopLevelKeys(json) as Record<string, JsonValue>;
    const shape: StationShape = { ...normalized };

    if (isJsonObject(normalized.id)) {
      shape.id = normalizeTopLevelKeys(normalized.id) as StationIdShape;
    }

    if (isJsonObject(normalized.icon)) {
      shape.icon = Cover.fromJSON(normalized.icon);
    }

    return new this(shape);
  }

  get stationId(): string | null {
    if (typeof this.id?.type !== "string" || typeof this.id?.tag !== "string") {
      return null;
    }

    return `${this.id.type}:${this.id.tag}`;
  }

  getIconUrl(size?: string): string | null {
    return this.icon?.getUrl(size) ?? null;
  }
}
