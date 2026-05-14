import type { DeepReadonly, JsonObject } from "../../core/json.ts";
import { assignModelShape } from "../../core/model.ts";
import { normalizeObject } from "../../core/parsing.ts";

export interface DownloadInfoShape extends Record<string, unknown> {
  codec?: string;
  bitrateInKbps?: number;
  downloadInfoUrl?: string;
  direct?: string | boolean;
  preview?: boolean;
  transport?: string;
  gain?: boolean | number;
  fileSize?: number;
}

export class DownloadInfo {
  declare readonly codec?: string;
  declare readonly bitrateInKbps?: number;
  declare readonly downloadInfoUrl?: string;
  declare readonly direct?: string | boolean;
  declare readonly preview?: boolean;
  declare readonly transport?: string;
  declare readonly gain?: boolean | number;
  declare readonly fileSize?: number;

  constructor(shape: DownloadInfoShape) {
    assignModelShape(this, shape);
  }

  static fromJSON<TModel extends DownloadInfo>(
    this: new (shape: DownloadInfoShape) => TModel,
    json: DeepReadonly<JsonObject>,
  ): TModel {
    return new this(normalizeObject(json) as DownloadInfoShape);
  }

  matches(codec: string, bitrateInKbps: number): boolean {
    return this.codec === codec && this.bitrateInKbps === bitrateInKbps;
  }
}
