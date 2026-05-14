import { encodePathSegment } from "../core/identifiers.ts";
import type { SupportedLanguage, HttpTransport } from "../http/types.ts";
import { Feed } from "../models/feed/Feed.ts";
import { ChartInfo } from "../models/landing/ChartInfo.ts";
import { Landing } from "../models/landing/Landing.ts";
import { LandingList } from "../models/landing/LandingList.ts";
import { TagResult } from "../models/landing/TagResult.ts";
import { parseObjectResult } from "./parsing.ts";

export interface LandingOptions {
  readonly language?: SupportedLanguage;
}

export interface LandingChartOptions {
  readonly language?: SupportedLanguage;
}

export interface LandingListOptions {
  readonly language?: SupportedLanguage;
}

export interface LandingTagOptions {
  readonly language?: SupportedLanguage;
}

export interface FeedOptions {
  readonly language?: SupportedLanguage;
}

export class LandingResource {
  private readonly transport: HttpTransport;

  constructor(transport: HttpTransport) {
    this.transport = transport;
  }

  async landing(blocks: readonly string[], options: LandingOptions = {}): Promise<Landing> {
    const response = await this.transport.request({
      method: "GET",
      path: "/landing3",
      query: {
        blocks: blocks.join(","),
        lang: options.language,
      },
    });
    return Landing.fromJSON(parseObjectResult(response));
  }

  async chart(
    chartOption?: string,
    options: LandingChartOptions = {},
  ): Promise<ChartInfo> {
    const response = await this.transport.request({
      method: "GET",
      path: chartOption === undefined
        ? "/landing3/chart"
        : `/landing3/chart/${encodePathSegment(chartOption)}`,
      query: {
        lang: options.language,
      },
    });

    return ChartInfo.fromJSON(parseObjectResult(response));
  }

  async newReleases(options: LandingListOptions = {}): Promise<LandingList> {
    return this.getLandingList("/landing3/new-releases", options);
  }

  async newPlaylists(options: LandingListOptions = {}): Promise<LandingList> {
    return this.getLandingList("/landing3/new-playlists", options);
  }

  async podcasts(options: LandingListOptions = {}): Promise<LandingList> {
    return this.getLandingList("/landing3/podcasts", options);
  }

  async tags(
    tagId: string | number,
    options: LandingTagOptions = {},
  ): Promise<TagResult> {
    const response = await this.transport.request({
      method: "GET",
      path: `/tags/${encodePathSegment(tagId)}/playlist-ids`,
      query: {
        lang: options.language,
      },
    });

    return TagResult.fromJSON(parseObjectResult(response));
  }

  async feed(options: FeedOptions = {}): Promise<Feed> {
    const response = await this.transport.request({
      method: "GET",
      path: "/feed",
      query: {
        lang: options.language,
      },
    });

    return Feed.fromJSON(parseObjectResult(response));
  }

  private async getLandingList(
    path: string,
    options: LandingListOptions,
  ): Promise<LandingList> {
    const response = await this.transport.request({
      method: "GET",
      path,
      query: {
        lang: options.language,
      },
    });

    return LandingList.fromJSON(parseObjectResult(response));
  }
}
