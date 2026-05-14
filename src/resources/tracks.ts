import { encodePathSegment, joinIds, type TrackId } from "../core/identifiers.ts";
import type { HttpTransport, SupportedLanguage } from "../http/types.ts";
import { DownloadInfo } from "../models/shared/DownloadInfo.ts";
import { SimilarTracks } from "../models/track/SimilarTracks.ts";
import { Supplement } from "../models/track/Supplement.ts";
import { Track } from "../models/track/Track.ts";
import { TrackFullInfo } from "../models/track/TrackFullInfo.ts";
import { TrackLyrics } from "../models/track/TrackLyrics.ts";
import { TrackTrailer } from "../models/track/TrackTrailer.ts";
import { parseObjectArrayResult, parseObjectResult } from "./parsing.ts";

export interface TracksByIdsOptions {
  readonly language?: SupportedLanguage;
  readonly withPositions?: boolean;
}

export type TrackDownloadInfo = DownloadInfo;

export interface TrackDownloadInfoOptions {
  readonly language?: SupportedLanguage;
  readonly getDirectLinks?: boolean;
  readonly preview?: boolean;
}

export interface TrackSupplementOptions {
  readonly language?: SupportedLanguage;
}

export interface TrackLyricsOptions {
  readonly language?: SupportedLanguage;
  readonly format?: "TEXT" | "LRC" | (string & {});
  readonly timestamp?: string | number;
  readonly sign?: string;
}

export interface TrackSimilarOptions {
  readonly language?: SupportedLanguage;
}

export interface TrackTrailerOptions {
  readonly language?: SupportedLanguage;
}

export interface TrackFullInfoOptions {
  readonly language?: SupportedLanguage;
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
  ): Promise<readonly DownloadInfo[]> {
    const response = await this.transport.request({
      method: "GET",
      path: `/tracks/${encodePathSegment(trackId)}/download-info`,
      query: {
        lang: options.language,
        "get-direct-links": options.getDirectLinks,
        preview: options.preview,
      },
    });

    return parseObjectArrayResult(response, (entry) => DownloadInfo.fromJSON(entry));
  }

  async supplement(
    trackId: TrackId,
    options: TrackSupplementOptions = {},
  ): Promise<Supplement> {
    const response = await this.transport.request({
      method: "GET",
      path: `/tracks/${encodePathSegment(trackId)}/supplement`,
      query: {
        lang: options.language,
      },
    });

    return Supplement.fromJSON(parseObjectResult(response));
  }

  async lyrics(
    trackId: TrackId,
    options: TrackLyricsOptions = {},
  ): Promise<TrackLyrics> {
    const response = await this.transport.request({
      method: "GET",
      path: `/tracks/${encodePathSegment(trackId)}/lyrics`,
      query: {
        lang: options.language,
        format: options.format,
        timeStamp: options.timestamp,
        sign: options.sign,
      },
    });

    return TrackLyrics.fromJSON(parseObjectResult(response));
  }

  async similar(
    trackId: TrackId,
    options: TrackSimilarOptions = {},
  ): Promise<SimilarTracks> {
    const response = await this.transport.request({
      method: "GET",
      path: `/tracks/${encodePathSegment(trackId)}/similar`,
      query: {
        lang: options.language,
      },
    });

    return SimilarTracks.fromJSON(parseObjectResult(response));
  }

  async trailer(
    trackId: TrackId,
    options: TrackTrailerOptions = {},
  ): Promise<TrackTrailer> {
    const response = await this.transport.request({
      method: "GET",
      path: `/tracks/${encodePathSegment(trackId)}/trailer`,
      query: {
        lang: options.language,
      },
    });

    return TrackTrailer.fromJSON(parseObjectResult(response));
  }

  async fullInfo(
    trackId: TrackId,
    options: TrackFullInfoOptions = {},
  ): Promise<TrackFullInfo> {
    const response = await this.transport.request({
      method: "GET",
      path: `/tracks/${encodePathSegment(trackId)}/full-info`,
      query: {
        lang: options.language,
      },
    });

    return TrackFullInfo.fromJSON(parseObjectResult(response));
  }
}
