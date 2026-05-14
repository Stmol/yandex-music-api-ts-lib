import type { DeepReadonly, JsonObject, JsonValue } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject, parseOptionalJsonObject } from "../../core/parsing.ts";
import { DiscreteScale } from "./DiscreteScale.ts";

export interface RadioSettingsShape extends Record<string, unknown> {
  diversity?: DiscreteScale | null;
  mood?: DiscreteScale | null;
  energy?: DiscreteScale | null;
  language?: DiscreteScale | null;
}

export class RadioSettings {
  declare readonly diversity?: DiscreteScale | null;
  declare readonly mood?: DiscreteScale | null;
  declare readonly energy?: DiscreteScale | null;
  declare readonly language?: DiscreteScale | null;

  constructor(shape: RadioSettingsShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends RadioSettings>(
    this: new (shape: RadioSettingsShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    const normalized = normalizeObject(json) as Record<string, JsonValue>;
    const shape: RadioSettingsShape = { ...normalized };
    const diversity = parseOptionalJsonObject(normalized.diversity, "$.diversity", (entry) =>
      DiscreteScale.fromJSON(entry));
    const mood = parseOptionalJsonObject(normalized.mood, "$.mood", (entry) =>
      DiscreteScale.fromJSON(entry));
    const energy = parseOptionalJsonObject(normalized.energy, "$.energy", (entry) =>
      DiscreteScale.fromJSON(entry));
    const language = parseOptionalJsonObject(normalized.language, "$.language", (entry) =>
      DiscreteScale.fromJSON(entry));

    if (diversity !== undefined) shape.diversity = diversity;
    if (mood !== undefined) shape.mood = mood;
    if (energy !== undefined) shape.energy = energy;
    if (language !== undefined) shape.language = language;

    return new this(shape);
  }
}
