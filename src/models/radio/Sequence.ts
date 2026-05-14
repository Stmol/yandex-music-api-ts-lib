import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { Track } from "../track/Track.ts";

export interface SequenceShape extends Record<string, unknown> {
  type?: string;
  track?: Track | null;
}

export class Sequence {
  declare readonly type?: string;
  declare readonly track?: Track | null;

  constructor(shape: SequenceShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Sequence>(
    this: new (shape: SequenceShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: SequenceShape = { ...normalized };
    const track = parseOptionalJsonObject(normalized.track, "$.track", (entry) =>
      Track.fromJSON(entry));

    if (track !== undefined) shape.track = track;

    return new this(shape);
  }
}
