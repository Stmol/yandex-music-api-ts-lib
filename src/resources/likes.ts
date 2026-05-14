import type { ArtistId, TrackId, UserId } from "../core/identifiers.ts";
import { encodePathSegment, joinIds } from "../core/identifiers.ts";
import type { JsonObject } from "../core/json.ts";
import { expectJsonObject } from "../core/parsing.ts";
import type { HttpResponse, HttpTransport } from "../http/types.ts";
import { parseYandexApiResponse } from "../http/response.ts";
import { Artist } from "../models/artist/Artist.ts";
import { ClipsWillLike } from "../models/clip/ClipsWillLike.ts";
import { Like } from "../models/shared/Like.ts";
import { TracksList } from "../models/shared/TracksList.ts";
import type { AlbumId } from "./albums.ts";
import { parseObjectArrayResult, parseObjectResult } from "./parsing.ts";

export type LikeId = string | number;
export type LikeIds<TId extends LikeId = LikeId> = TId | readonly TId[];
export type PlaylistLikeId = string | number;

export interface LikesMutationOptions {
  readonly userId: UserId;
}

export interface LikedTracksOptions {
  readonly ifModifiedSinceRevision?: number;
}

export interface LikedAlbumsOptions {
  readonly rich?: boolean;
}

export interface LikedArtistsOptions {
  readonly withTimestamps?: boolean;
}

export interface DislikedTracksOptions {
  readonly ifModifiedSinceRevision?: number;
}

export interface LikedClipsOptions {
  readonly page?: number;
  readonly pageSize?: number;
}

function createFormBody(entries: Readonly<Record<string, string | number>>): URLSearchParams {
  const body = new URLSearchParams();

  for (const [key, value] of Object.entries(entries)) {
    body.set(key, String(value));
  }

  return body;
}

function normalizeIds<TId extends LikeId>(ids: LikeIds<TId>): readonly TId[] {
  if (typeof ids === "string" || typeof ids === "number") {
    return [ids];
  }

  return ids;
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseMutationSuccess(response: HttpResponse, acceptsRevisionObject: boolean): boolean {
  const result = parseYandexApiResponse<unknown>(response);

  if (result === "ok") {
    return true;
  }

  return acceptsRevisionObject && isJsonObject(result) && "revision" in result;
}

function parseObjectMutationSuccess(response: HttpResponse): boolean {
  const result = parseYandexApiResponse<unknown>(response);

  return result === "ok" || isJsonObject(result);
}

function parseLibraryTracksList(response: HttpResponse): TracksList {
  const result = expectJsonObject(parseYandexApiResponse<unknown>(response), "$.result", {
    status: response.status,
    url: response.url,
  });
  const library = expectJsonObject(result.library, "$.result.library", {
    status: response.status,
    url: response.url,
  });

  return TracksList.fromJSON(library);
}

export class LikesResource {
  private readonly transport: HttpTransport;

  constructor(transport: HttpTransport) {
    this.transport = transport;
  }

  async likedTracks(
    userId: UserId,
    options: LikedTracksOptions = {},
  ): Promise<TracksList> {
    const response = await this.transport.request({
      method: "GET",
      path: `/users/${encodePathSegment(userId)}/likes/tracks`,
      query: {
        "if-modified-since-revision": options.ifModifiedSinceRevision,
      },
    });

    return parseLibraryTracksList(response);
  }

  async likedAlbums(
    userId: UserId,
    options: LikedAlbumsOptions = {},
  ): Promise<readonly Like[]> {
    const response = await this.transport.request({
      method: "GET",
      path: `/users/${encodePathSegment(userId)}/likes/albums`,
      query: {
        rich: options.rich ?? true,
      },
    });

    return parseObjectArrayResult(response, (entry) => Like.fromJSON(entry, "album"));
  }

  async likedArtists(
    userId: UserId,
    options: LikedArtistsOptions = {},
  ): Promise<readonly Like[]> {
    const response = await this.transport.request({
      method: "GET",
      path: `/users/${encodePathSegment(userId)}/likes/artists`,
      query: {
        "with-timestamps": options.withTimestamps ?? true,
      },
    });

    return parseObjectArrayResult(response, (entry) => Like.fromJSON(entry, "artist"));
  }

  async likedPlaylists(userId: UserId): Promise<readonly Like[]> {
    const response = await this.transport.request({
      method: "GET",
      path: `/users/${encodePathSegment(userId)}/likes/playlists`,
    });

    return parseObjectArrayResult(response, (entry) => Like.fromJSON(entry, "playlist"));
  }

  async dislikedTracks(
    userId: UserId,
    options: DislikedTracksOptions = {},
  ): Promise<TracksList> {
    const response = await this.transport.request({
      method: "GET",
      path: `/users/${encodePathSegment(userId)}/dislikes/tracks`,
      query: {
        if_modified_since_revision: options.ifModifiedSinceRevision,
      },
    });

    return parseLibraryTracksList(response);
  }

  async dislikedArtists(userId: UserId): Promise<readonly Artist[]> {
    const response = await this.transport.request({
      method: "GET",
      path: `/users/${encodePathSegment(userId)}/dislikes/artists`,
    });

    return parseObjectArrayResult(response, (entry) => Artist.fromJSON(entry));
  }

  async likedClips(
    userId: UserId,
    options: LikedClipsOptions = {},
  ): Promise<ClipsWillLike> {
    const response = await this.transport.request({
      method: "GET",
      path: `/users/${encodePathSegment(userId)}/likes/clips`,
      query: {
        page: options.page ?? 0,
        pageSize: options.pageSize ?? 100,
      },
    });

    return ClipsWillLike.fromJSON(parseObjectResult(response));
  }

  private async mutateLikes(
    objectType: "album" | "artist" | "playlist" | "track",
    ids: LikeIds,
    remove: boolean,
    options: LikesMutationOptions,
  ): Promise<boolean> {
    const response = await this.transport.request({
      body: createFormBody({
        [`${objectType}-ids`]: joinIds(normalizeIds(ids)),
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      method: "POST",
      path: `/users/${encodePathSegment(options.userId)}/likes/${objectType}s/${remove ? "remove" : "add-multiple"}`,
    });

    return parseMutationSuccess(response, objectType === "track");
  }

  private async mutateDislikes(
    objectType: "artist" | "track",
    ids: LikeIds,
    remove: boolean,
    options: LikesMutationOptions,
  ): Promise<boolean> {
    const response = await this.transport.request({
      body: createFormBody({
        [`${objectType}-ids`]: joinIds(normalizeIds(ids)),
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      method: "POST",
      path: `/users/${encodePathSegment(options.userId)}/dislikes/${objectType}s/${remove ? "remove" : "add-multiple"}`,
    });

    return parseMutationSuccess(response, objectType === "track");
  }

  async addTracks(trackIds: LikeIds<TrackId>, options: LikesMutationOptions): Promise<boolean> {
    return this.mutateLikes("track", trackIds, false, options);
  }

  async removeTracks(trackIds: LikeIds<TrackId>, options: LikesMutationOptions): Promise<boolean> {
    return this.mutateLikes("track", trackIds, true, options);
  }

  async addAlbums(albumIds: LikeIds<AlbumId>, options: LikesMutationOptions): Promise<boolean> {
    return this.mutateLikes("album", albumIds, false, options);
  }

  async removeAlbums(albumIds: LikeIds<AlbumId>, options: LikesMutationOptions): Promise<boolean> {
    return this.mutateLikes("album", albumIds, true, options);
  }

  async addArtists(artistIds: LikeIds<ArtistId>, options: LikesMutationOptions): Promise<boolean> {
    return this.mutateLikes("artist", artistIds, false, options);
  }

  async removeArtists(artistIds: LikeIds<ArtistId>, options: LikesMutationOptions): Promise<boolean> {
    return this.mutateLikes("artist", artistIds, true, options);
  }

  async addPlaylists(
    playlistIds: LikeIds<PlaylistLikeId>,
    options: LikesMutationOptions,
  ): Promise<boolean> {
    return this.mutateLikes("playlist", playlistIds, false, options);
  }

  async removePlaylists(
    playlistIds: LikeIds<PlaylistLikeId>,
    options: LikesMutationOptions,
  ): Promise<boolean> {
    return this.mutateLikes("playlist", playlistIds, true, options);
  }

  async addClip(clipId: LikeId, options: LikesMutationOptions): Promise<boolean> {
    const response = await this.transport.request({
      method: "POST",
      path: `/users/${encodePathSegment(options.userId)}/likes/clips/add`,
      query: {
        "clip-id": clipId,
      },
    });

    return parseObjectMutationSuccess(response);
  }

  async removeClip(clipId: LikeId, options: LikesMutationOptions): Promise<boolean> {
    const response = await this.transport.request({
      method: "POST",
      path: `/users/${encodePathSegment(options.userId)}/likes/clips/${encodePathSegment(clipId)}/remove`,
    });

    return parseObjectMutationSuccess(response);
  }

  async addTrackDislikes(
    trackIds: LikeIds<TrackId>,
    options: LikesMutationOptions,
  ): Promise<boolean> {
    return this.mutateDislikes("track", trackIds, false, options);
  }

  async removeTrackDislikes(
    trackIds: LikeIds<TrackId>,
    options: LikesMutationOptions,
  ): Promise<boolean> {
    return this.mutateDislikes("track", trackIds, true, options);
  }

  async addArtistDislikes(
    artistIds: LikeIds<ArtistId>,
    options: LikesMutationOptions,
  ): Promise<boolean> {
    return this.mutateDislikes("artist", artistIds, false, options);
  }

  async removeArtistDislikes(
    artistIds: LikeIds<ArtistId>,
    options: LikesMutationOptions,
  ): Promise<boolean> {
    return this.mutateDislikes("artist", artistIds, true, options);
  }
}
