import { normalizeTopLevelKeys } from "../core/normalize.ts";
import type { JsonObject, JsonValue } from "../core/json.ts";
import { parseYandexApiResponse } from "../http/response.ts";
import type { HttpTransport, SupportedLanguage } from "../http/types.ts";
import { Track } from "../models/track/Track.ts";

export interface TracksByIdsOptions {
  readonly language?: SupportedLanguage;
  readonly withPositions?: boolean;
}

export interface TrackDownloadInfo {
  readonly codec?: string;
  readonly bitrateInKbps?: number;
  readonly downloadInfoUrl?: string;
  readonly direct?: string;
  readonly preview?: boolean;
  readonly transport?: string;
}

export interface TrackDownloadInfoOptions {
  readonly language?: SupportedLanguage;
  readonly getDirectLinks?: boolean;
  readonly preview?: boolean;
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseTracks(value: unknown): readonly Track[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isJsonObject).map((entry) => Track.fromJSON(entry));
}

function parseDownloadInfo(value: unknown): readonly TrackDownloadInfo[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isJsonObject)
    .map((entry) => normalizeTopLevelKeys(entry) as Record<string, JsonValue>)
    .map((entry) => entry as TrackDownloadInfo);
}

export class TracksResource {
  private readonly transport: HttpTransport;

  constructor(transport: HttpTransport) {
    this.transport = transport;
  }

  async byIds(
    trackIds: readonly (string | number)[],
    options: TracksByIdsOptions = {},
  ): Promise<readonly Track[]> {
    const response = await this.transport.request({
      method: "GET",
      path: "/tracks",
      query: {
        lang: options.language,
        "track-ids": trackIds.join(","),
        "with-positions": options.withPositions,
      },
    });

    return parseTracks(parseYandexApiResponse<unknown>(response));
  }

  async tracks(
    trackIds: readonly (string | number)[],
    options: TracksByIdsOptions = {},
  ): Promise<readonly Track[]> {
    return this.byIds(trackIds, options);
  }

  async downloadInfo(
    trackId: string | number,
    options: TrackDownloadInfoOptions = {},
  ): Promise<readonly TrackDownloadInfo[]> {
    const response = await this.transport.request({
      method: "GET",
      path: `/tracks/${encodeURIComponent(String(trackId))}/download-info`,
      query: {
        lang: options.language,
        "get-direct-links": options.getDirectLinks,
        preview: options.preview,
      },
    });

    return parseDownloadInfo(parseYandexApiResponse<unknown>(response));
  }
}
