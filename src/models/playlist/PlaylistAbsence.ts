import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface PlaylistAbsenceShape extends Record<string, unknown> {
  kind?: string;
  reason?: string;
  text?: string;
}

export class PlaylistAbsence {
  declare readonly kind?: string;
  declare readonly reason?: string;
  declare readonly text?: string;

  constructor(shape: PlaylistAbsenceShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends PlaylistAbsence>(
    this: new (shape: PlaylistAbsenceShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
