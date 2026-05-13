import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
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

export class Station {
  declare readonly id?: StationIdShape | null;
  declare readonly name?: string;
  declare readonly icon?: Cover | null;

  constructor(shape: StationShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Station>(
    this: new (shape: StationShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: StationShape = { ...normalized };
    const id = parseOptionalJsonObject(normalized.id, "$.id", (entry) =>
      normalizeObject(entry) as StationIdShape);
    const icon = parseOptionalJsonObject(normalized.icon, "$.icon", (entry) =>
      Cover.fromJSON(entry));

    if (id !== undefined) shape.id = id;
    if (icon !== undefined) shape.icon = icon;

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
