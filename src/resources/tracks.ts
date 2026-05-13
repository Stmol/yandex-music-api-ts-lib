import { joinIds, type TrackId } from "../core/identifiers.ts";
import { normalizeObject } from "../core/parsing.ts";
import type { HttpTransport, SupportedLanguage } from "../http/types.ts";
import { Track } from "../models/track/Track.ts";
import { parseObjectArrayResult } from "./parsing.ts";

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

export class TracksResource {
  private readonly transport: HttpTransport;

  constructor(transport: HttpTransport) {
    this.transport = transport;
  }

  async byIds(
    trackIds: readonly TrackId[],
    options: TracksByIdsOptions = {},
  ): Promise<readonly Track[]> {
    const response = await this.transport.request({
      method: "GET",
      path: "/tracks",
      query: {
        lang: options.language,
        "track-ids": joinIds(trackIds),
        "with-positions": options.withPositions,
      },
    });

    return parseObjectArrayResult(response, (entry) => Track.fromJSON(entry));
  }

  async downloadInfo(
    trackId: TrackId,
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

    return parseObjectArrayResult(response, (entry) => normalizeObject(entry) as TrackDownloadInfo);
  }
}
