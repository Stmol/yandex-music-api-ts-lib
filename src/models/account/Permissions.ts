import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { PermissionAlerts } from "../shared/PermissionAlerts.ts";

export interface PermissionsShape extends Record<string, unknown> {
  until?: string | null;
  values?: readonly unknown[];
  default?: readonly unknown[];
  alerts?: PermissionAlerts | null;
}

export class Permissions {
  declare readonly until?: string | null;
  declare readonly values?: readonly unknown[];
  declare readonly default?: readonly unknown[];
  declare readonly alerts?: PermissionAlerts | null;

  constructor(shape: PermissionsShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends Permissions>(
    this: new (shape: PermissionsShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: PermissionsShape = { ...normalized };
    const alerts = parseOptionalJsonObject(normalized.alerts, "$.alerts", (entry) =>
      PermissionAlerts.fromJSON(entry));

    if (alerts !== undefined) shape.alerts = alerts;

    return new this(shape);
  }
}
