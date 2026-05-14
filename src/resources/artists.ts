import { encodePathSegment, joinIds, type ArtistId } from "../core/identifiers.ts";
import type { SupportedLanguage, HttpTransport } from "../http/types.ts";
import { Artist } from "../models/artist/Artist.ts";
import { ArtistAlbums } from "../models/artist/ArtistAlbums.ts";
import { ArtistSimilar } from "../models/artist/ArtistSimilar.ts";
import { ArtistTracks } from "../models/artist/ArtistTracks.ts";
import { BriefInfo } from "../models/artist/BriefInfo.ts";
import { parseObjectArrayResult, parseObjectResult } from "./parsing.ts";

export interface ArtistsByIdsOptions {
  readonly language?: SupportedLanguage;
}

export interface ArtistBriefInfoOptions {
  readonly language?: SupportedLanguage;
}

export interface ArtistTracksOptions {
  readonly language?: SupportedLanguage;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface ArtistAlbumsOptions {
  readonly language?: SupportedLanguage;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface ArtistSimilarOptions {
  readonly language?: SupportedLanguage;
}

export class ArtistsResource {
  private readonly transport: HttpTransport;

  constructor(transport: HttpTransport) {
    this.transport = transport;
  }

  async byIds(
    artistIds: readonly ArtistId[],
    options: ArtistsByIdsOptions = {},
  ): Promise<readonly Artist[]> {
    const response = await this.transport.request({
      method: "GET",
      path: "/artists",
      query: {
        lang: options.language,
        "artist-ids": joinIds(artistIds),
      },
    });

    return parseObjectArrayResult(response, (entry) => Artist.fromJSON(entry));
  }

  async briefInfo(
    artistId: ArtistId,
    options: ArtistBriefInfoOptions = {},
  ): Promise<BriefInfo> {
    const response = await this.transport.request({
      method: "GET",
      path: `/artists/${encodePathSegment(artistId)}/brief-info`,
      query: {
        lang: options.language,
      },
    });

    return BriefInfo.fromJSON(parseObjectResult(response));
  }

  async tracks(
    artistId: ArtistId,
    options: ArtistTracksOptions = {},
  ): Promise<ArtistTracks> {
    const response = await this.transport.request({
      method: "GET",
      path: `/artists/${encodePathSegment(artistId)}/tracks`,
      query: {
        lang: options.language,
        page: options.page,
        "page-size": options.pageSize,
      },
    });

    return ArtistTracks.fromJSON(parseObjectResult(response));
  }

  async albums(
    artistId: ArtistId,
    options: ArtistAlbumsOptions = {},
  ): Promise<ArtistAlbums> {
    const response = await this.transport.request({
      method: "GET",
      path: `/artists/${encodePathSegment(artistId)}/albums`,
      query: {
        lang: options.language,
        page: options.page,
        "page-size": options.pageSize,
      },
    });

    return ArtistAlbums.fromJSON(parseObjectResult(response));
  }

  async similar(
    artistId: ArtistId,
    options: ArtistSimilarOptions = {},
  ): Promise<ArtistSimilar> {
    const response = await this.transport.request({
      method: "GET",
      path: `/artists/${encodePathSegment(artistId)}/similar`,
      query: {
        lang: options.language,
      },
    });

    return ArtistSimilar.fromJSON(parseObjectResult(response));
  }
}
