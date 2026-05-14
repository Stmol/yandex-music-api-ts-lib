import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface PermissionAlertsShape extends Record<string, unknown> {
  alerts?: readonly unknown[];
  title?: string;
  text?: string;
}

export class PermissionAlerts {
  declare readonly alerts?: readonly unknown[];
  declare readonly title?: string;
  declare readonly text?: string;

  constructor(shape: PermissionAlertsShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends PermissionAlerts>(
    this: new (shape: PermissionAlertsShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json));
  }
}
