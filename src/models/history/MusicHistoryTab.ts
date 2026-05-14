import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObjectArray } from "../../core/parsing.ts";
import { MusicHistoryGroup } from "./MusicHistoryGroup.ts";

export interface MusicHistoryTabShape extends Record<string, unknown> {
  id?: string;
  title?: string;
  groups?: readonly MusicHistoryGroup[];
}

export class MusicHistoryTab {
  declare readonly id?: string;
  declare readonly title?: string;
  declare readonly groups?: readonly MusicHistoryGroup[];

  constructor(shape: MusicHistoryTabShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends MusicHistoryTab>(
    this: new (shape: MusicHistoryTabShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: MusicHistoryTabShape = { ...normalized };
    const groups = parseOptionalJsonObjectArray(normalized.groups, "$.groups", (entry) =>
      MusicHistoryGroup.fromJSON(entry));

    if (groups !== undefined) shape.groups = groups;

    return new this(shape);
  }
}
