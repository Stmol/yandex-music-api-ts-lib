import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface WaveAgentEntityShape extends Record<string, unknown> {
  id?: string | number;
  type?: string;
}

export class WaveAgentEntity {
  declare readonly id?: string | number;
  declare readonly type?: string;

  constructor(shape: WaveAgentEntityShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends WaveAgentEntity>(
    this: new (shape: WaveAgentEntityShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
