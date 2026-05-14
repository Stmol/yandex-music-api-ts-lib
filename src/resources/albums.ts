import { encodePathSegment, joinIds } from "../core/identifiers.ts";
import type { HttpTransport, SupportedLanguage } from "../http/types.ts";
import { Album } from "../models/album/Album.ts";
import { AlbumSimilarEntities } from "../models/album/AlbumSimilarEntities.ts";
import { AlbumTrailer } from "../models/album/AlbumTrailer.ts";
import { parseObjectArrayResult, parseObjectResult } from "./parsing.ts";

export type AlbumId = string | number;

export interface AlbumsByIdsOptions {
  readonly language?: SupportedLanguage;
}

export interface AlbumWithTracksOptions {
  readonly language?: SupportedLanguage;
}

export interface AlbumSimilarEntitiesOptions {
  readonly language?: SupportedLanguage;
}

export interface AlbumTrailerOptions {
  readonly language?: SupportedLanguage;
}

export class AlbumsResource {
  private readonly transport: HttpTransport;

  constructor(transport: HttpTransport) {
    this.transport = transport;
  }

  async byIds(
    albumIds: readonly AlbumId[],
    options: AlbumsByIdsOptions = {},
  ): Promise<readonly Album[]> {
    const response = await this.transport.request({
      method: "GET",
      path: "/albums",
      query: {
        lang: options.language,
        "album-ids": joinIds(albumIds),
      },
    });

    return parseObjectArrayResult(response, (entry) => Album.fromJSON(entry));
  }

  async withTracks(
    albumId: AlbumId,
    options: AlbumWithTracksOptions = {},
  ): Promise<Album> {
    const response = await this.transport.request({
      method: "GET",
      path: `/albums/${encodePathSegment(albumId)}/with-tracks`,
      query: {
        lang: options.language,
      },
    });

    return Album.fromJSON(parseObjectResult(response));
  }

  async similarEntities(
    albumId: AlbumId,
    options: AlbumSimilarEntitiesOptions = {},
  ): Promise<AlbumSimilarEntities> {
    const response = await this.transport.request({
      method: "GET",
      path: `/albums/${encodePathSegment(albumId)}/similar-entities`,
      query: {
        lang: options.language,
      },
    });

    return AlbumSimilarEntities.fromJSON(parseObjectResult(response));
  }

  async trailer(
    albumId: AlbumId,
    options: AlbumTrailerOptions = {},
  ): Promise<AlbumTrailer> {
    const response = await this.transport.request({
      method: "GET",
      path: `/albums/${encodePathSegment(albumId)}/trailer`,
      query: {
        lang: options.language,
      },
    });

    return AlbumTrailer.fromJSON(parseObjectResult(response));
  }
}
