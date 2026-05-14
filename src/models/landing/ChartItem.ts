import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { Track } from "../track/Track.ts";
import { ChartInfo } from "./ChartInfo.ts";

export interface ChartItemShape extends Record<string, unknown> {
  track?: Track | null;
  chart?: ChartInfo | null;
}

export class ChartItem {
  declare readonly track?: Track | null;
  declare readonly chart?: ChartInfo | null;

  constructor(shape: ChartItemShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends ChartItem>(
    this: new (shape: ChartItemShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: ChartItemShape = { ...normalized };
    const track = parseOptionalJsonObject(normalized.track, "$.track", (entry) =>
      Track.fromJSON(entry));
    const chart = parseOptionalJsonObject(normalized.chart, "$.chart", (entry) =>
      ChartInfo.fromJSON(entry));

    if (track !== undefined) shape.track = track;
    if (chart !== undefined) shape.chart = chart;

    return new this(shape);
  }
}
