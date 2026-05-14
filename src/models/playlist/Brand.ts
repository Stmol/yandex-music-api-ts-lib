import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { Cover } from "../shared/Cover.ts";
import { Icon } from "../shared/Icon.ts";

export interface BrandShape extends Record<string, unknown> {
  id?: string | number;
  title?: string;
  image?: string;
  cover?: Cover | null;
  icon?: Icon | null;
}

export class Brand {
  declare readonly id?: string | number;
  declare readonly title?: string;
  declare readonly image?: string;
  declare readonly cover?: Cover | null;
  declare readonly icon?: Icon | null;

  constructor(shape: BrandShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Brand>(
    this: new (shape: BrandShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: BrandShape = { ...normalized };
    const cover = parseOptionalJsonObject(normalized.cover, "$.cover", (entry) =>
      Cover.fromJSON(entry));
    const icon = parseOptionalJsonObject(normalized.icon, "$.icon", (entry) =>
      Icon.fromJSON(entry));

    if (cover !== undefined) shape.cover = cover;
    if (icon !== undefined) shape.icon = icon;

    return new this(shape);
  }
}
