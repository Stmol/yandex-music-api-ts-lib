import { ApiSchemaError } from "../core/errors.ts";
import { encodePathSegment, joinIds, type ArtistId } from "../core/identifiers.ts";
import type { SupportedLanguage, HttpTransport } from "../http/types.ts";
import { Artist } from "../models/artist/Artist.ts";
import { ArtistAlbums } from "../models/artist/ArtistAlbums.ts";
import { ArtistInfo } from "../models/artist/ArtistInfo.ts";
import { ArtistLinks } from "../models/artist/ArtistLinks.ts";
import { ArtistSimilar } from "../models/artist/ArtistSimilar.ts";
import { ArtistTracks } from "../models/artist/ArtistTracks.ts";
import { BriefInfo } from "../models/artist/BriefInfo.ts";
import { parseArrayResult, parseObjectArrayResult, parseObjectResult } from "./parsing.ts";

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
  readonly sortBy?: string;
}

export interface ArtistSimilarOptions {
  readonly language?: SupportedLanguage;
}

export interface ArtistLinksOptions {
  readonly language?: SupportedLanguage;
}

export interface ArtistInfoOptions {
  readonly language?: SupportedLanguage;
}

export interface ArtistTrackIdsOptions {
  readonly language?: SupportedLanguage;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface ArtistSafeDirectAlbumsOptions {
  readonly language?: SupportedLanguage;
  readonly limit?: number;
  readonly sortBy?: string;
  readonly sortOrder?: string;
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

  async directAlbums(
    artistId: ArtistId,
    options: ArtistAlbumsOptions = {},
  ): Promise<ArtistAlbums> {
    return this.getArtistAlbums(artistId, "direct-albums", options);
  }

  async alsoAlbums(
    artistId: ArtistId,
    options: ArtistAlbumsOptions = {},
  ): Promise<ArtistAlbums> {
    return this.getArtistAlbums(artistId, "also-albums", options);
  }

  async discographyAlbums(
    artistId: ArtistId,
    options: ArtistAlbumsOptions = {},
  ): Promise<ArtistAlbums> {
    return this.getArtistAlbums(artistId, "discography-albums", options);
  }

  async safeDirectAlbums(
    artistId: ArtistId,
    options: ArtistSafeDirectAlbumsOptions = {},
  ): Promise<ArtistAlbums> {
    const response = await this.transport.request({
      method: "GET",
      path: `/artists/${encodePathSegment(artistId)}/safe-direct-albums`,
      query: {
        lang: options.language,
        limit: options.limit,
        "sort-by": options.sortBy,
        "sort-order": options.sortOrder,
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

  async links(
    artistId: ArtistId,
    options: ArtistLinksOptions = {},
  ): Promise<ArtistLinks> {
    const response = await this.transport.request({
      method: "GET",
      path: `/artists/${encodePathSegment(artistId)}/artist-links`,
      query: {
        lang: options.language,
      },
    });

    return ArtistLinks.fromJSON(parseObjectResult(response));
  }

  async info(
    artistId: ArtistId,
    options: ArtistInfoOptions = {},
  ): Promise<ArtistInfo> {
    const response = await this.transport.request({
      method: "GET",
      path: `/artists/${encodePathSegment(artistId)}/info`,
      query: {
        lang: options.language,
      },
    });

    return ArtistInfo.fromJSON(parseObjectResult(response));
  }

  async trackIds(
    artistId: ArtistId,
    options: ArtistTrackIdsOptions = {},
  ): Promise<readonly string[]> {
    const response = await this.transport.request({
      method: "GET",
      path: `/artists/${encodePathSegment(artistId)}/track-ids`,
      query: {
        lang: options.language,
        page: options.page,
        "page-size": options.pageSize,
      },
    });

    return parseArrayResult(response).map((entry, index) => {
      if (typeof entry === "string" || typeof entry === "number") {
        return String(entry);
      }

      const path = `$.result[${index}]`;

      throw new ApiSchemaError(`Expected string or number at ${path}.`, {
        details: entry,
        expected: "string | number",
        path,
        received: entry,
      });
    });
  }

  private async getArtistAlbums(
    artistId: ArtistId,
    endpoint: "also-albums" | "direct-albums" | "discography-albums",
    options: ArtistAlbumsOptions,
  ): Promise<ArtistAlbums> {
    const response = await this.transport.request({
      method: "GET",
      path: `/artists/${encodePathSegment(artistId)}/${endpoint}`,
      query: {
        lang: options.language,
        page: options.page,
        "page-size": options.pageSize,
        "sort-by": options.sortBy,
      },
    });

    return ArtistAlbums.fromJSON(parseObjectResult(response));
  }
}
