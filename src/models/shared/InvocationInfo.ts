import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface InvocationInfoShape extends Record<string, unknown> {
  hostname?: string;
  reqId?: string;
  execDurationMillis?: number;
}

export class InvocationInfo {
  declare readonly hostname?: string;
  declare readonly reqId?: string;
  declare readonly execDurationMillis?: number;

  constructor(shape: InvocationInfoShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends InvocationInfo>(
    this: new (shape: InvocationInfoShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json) as InvocationInfoShape);
  }
}
