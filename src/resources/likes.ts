import type { ArtistId, TrackId, UserId } from "../core/identifiers.ts";
import { encodePathSegment, joinIds } from "../core/identifiers.ts";
import type { JsonObject } from "../core/json.ts";
import type { HttpResponse, HttpTransport } from "../http/types.ts";
import { parseYandexApiResponse } from "../http/response.ts";
import type { AlbumId } from "./albums.ts";

export type LikeId = string | number;
export type LikeIds<TId extends LikeId = LikeId> = TId | readonly TId[];
export type PlaylistLikeId = string | number;

export interface LikesMutationOptions {
  readonly userId: UserId;
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

export class LikesResource {
  private readonly transport: HttpTransport;

  constructor(transport: HttpTransport) {
    this.transport = transport;
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
