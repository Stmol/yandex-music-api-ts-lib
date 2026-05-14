import {
  encodePathSegment,
  type PlaylistKind,
  type TrackId,
  type UserId,
} from "../core/identifiers.ts";
import type { SupportedLanguage, HttpTransport } from "../http/types.ts";
import { parseYandexApiResponse } from "../http/response.ts";
import { Playlist } from "../models/playlist/Playlist.ts";
import { parseObjectArrayResult, parseObjectResult } from "./parsing.ts";

export type PlaylistVisibility = "private" | "public";

export interface PlaylistListOptions {
  readonly language?: SupportedLanguage;
}

export interface PlaylistGetOptions {
  readonly language?: SupportedLanguage;
  readonly richTracks?: boolean;
}

export interface PlaylistCreateOptions {
  readonly title: string;
  readonly visibility?: PlaylistVisibility;
}

export interface PlaylistChangeOptions {
  readonly diff: string | readonly PlaylistDiffOperation[];
  readonly revision: number;
}

export interface PlaylistInsertTrackOptions {
  readonly albumId: string | number;
  readonly at?: number;
  readonly revision: number;
  readonly trackId: TrackId;
}

export interface PlaylistDeleteTracksOptions {
  readonly from: number;
  readonly revision: number;
  readonly to: number;
}

export interface PlaylistInsertDiffTrack {
  readonly albumId: string | number;
  readonly id: TrackId;
}

export interface PlaylistInsertDiffOperation {
  readonly at: number;
  readonly op: "insert";
  readonly tracks: readonly PlaylistInsertDiffTrack[];
}

export interface PlaylistDeleteDiffOperation {
  readonly from: number;
  readonly op: "delete";
  readonly to: number;
}

export type PlaylistDiffOperation = PlaylistInsertDiffOperation | PlaylistDeleteDiffOperation;

function createFormBody(entries: Readonly<Record<string, string | number | boolean>>): URLSearchParams {
  const body = new URLSearchParams();

  for (const [key, value] of Object.entries(entries)) {
    body.set(key, String(value));
  }

  return body;
}

function createPlaylistInsertOperation(
  at: number,
  tracks: readonly PlaylistInsertDiffTrack[],
): PlaylistInsertDiffOperation {
  return {
    at,
    op: "insert",
    tracks,
  };
}

function createPlaylistDeleteOperation(from: number, to: number): PlaylistDeleteDiffOperation {
  return {
    from,
    op: "delete",
    to,
  };
}

function normalizePlaylistDiffOperation(operation: PlaylistDiffOperation): Record<string, unknown> {
  if (operation.op === "insert") {
    return {
      at: operation.at,
      op: operation.op,
      tracks: operation.tracks.map((track) => ({
        albumId: String(track.albumId),
        id: String(track.id),
      })),
    };
  }

  return {
    from: operation.from,
    op: operation.op,
    to: operation.to,
  };
}

export function serializePlaylistDiff(diff: readonly PlaylistDiffOperation[]): string {
  return JSON.stringify(diff.map((operation) => normalizePlaylistDiffOperation(operation)));
}

export class PlaylistDiffBuilder {
  readonly #operations: PlaylistDiffOperation[] = [];

  insert(at: number, track: PlaylistInsertDiffTrack): this {
    this.#operations.push(createPlaylistInsertOperation(at, [track]));

    return this;
  }

  insertMany(at: number, tracks: readonly PlaylistInsertDiffTrack[]): this {
    this.#operations.push(createPlaylistInsertOperation(at, tracks));

    return this;
  }

  delete(from: number, to: number): this {
    this.#operations.push(createPlaylistDeleteOperation(from, to));

    return this;
  }

  toJSON(): string {
    return serializePlaylistDiff(this.#operations);
  }

  toOperations(): readonly PlaylistDiffOperation[] {
    return [...this.#operations];
  }
}

function getPlaylistDiffJson(diff: PlaylistChangeOptions["diff"]): string {
  return typeof diff === "string" ? diff : serializePlaylistDiff(diff);
}

export class PlaylistsResource {
  private readonly transport: HttpTransport;

  constructor(transport: HttpTransport) {
    this.transport = transport;
  }

  async list(
    userId: UserId,
    options: PlaylistListOptions = {},
  ): Promise<readonly Playlist[]> {
    const response = await this.transport.request({
      method: "GET",
      path: `/users/${encodePathSegment(userId)}/playlists/list`,
      query: {
        lang: options.language,
      },
    });

    return parseObjectArrayResult(response, (entry) => Playlist.fromJSON(entry));
  }

  async get(
    userId: UserId,
    kind: PlaylistKind,
    options: PlaylistGetOptions = {},
  ): Promise<Playlist> {
    const response = await this.transport.request({
      method: "GET",
      path: `/users/${encodePathSegment(userId)}/playlists/${encodePathSegment(kind)}`,
      query: {
        lang: options.language,
        "rich-tracks": options.richTracks,
      },
    });

    return Playlist.fromJSON(parseObjectResult(response));
  }

  async create(userId: UserId, options: PlaylistCreateOptions): Promise<Playlist> {
    const response = await this.transport.request({
      body: createFormBody({
        title: options.title,
        visibility: options.visibility ?? "public",
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      method: "POST",
      path: `/users/${encodePathSegment(userId)}/playlists/create`,
    });

    return Playlist.fromJSON(parseObjectResult(response));
  }

  async delete(userId: UserId, kind: PlaylistKind): Promise<boolean> {
    const response = await this.transport.request({
      method: "POST",
      path: `/users/${encodePathSegment(userId)}/playlists/${encodePathSegment(kind)}/delete`,
    });

    const result = parseYandexApiResponse<unknown>(response);

    return result === "ok" || result === null;
  }

  async rename(userId: UserId, kind: PlaylistKind, name: string): Promise<Playlist> {
    const response = await this.transport.request({
      body: createFormBody({
        value: name,
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      method: "POST",
      path: `/users/${encodePathSegment(userId)}/playlists/${encodePathSegment(kind)}/name`,
    });

    return Playlist.fromJSON(parseObjectResult(response));
  }

  async setVisibility(
    userId: UserId,
    kind: PlaylistKind,
    visibility: PlaylistVisibility,
  ): Promise<Playlist> {
    const response = await this.transport.request({
      body: createFormBody({
        value: visibility,
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      method: "POST",
      path: `/users/${encodePathSegment(userId)}/playlists/${encodePathSegment(kind)}/visibility`,
    });

    return Playlist.fromJSON(parseObjectResult(response));
  }

  async setDescription(
    userId: UserId,
    kind: PlaylistKind,
    description: string,
  ): Promise<Playlist> {
    const response = await this.transport.request({
      body: createFormBody({
        value: description,
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      method: "POST",
      path: `/users/${encodePathSegment(userId)}/playlists/${encodePathSegment(kind)}/description`,
    });

    return Playlist.fromJSON(parseObjectResult(response));
  }

  async change(
    userId: UserId,
    kind: PlaylistKind,
    options: PlaylistChangeOptions,
  ): Promise<Playlist> {
    const response = await this.transport.request({
      body: createFormBody({
        diff: getPlaylistDiffJson(options.diff),
        kind,
        revision: options.revision,
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      method: "POST",
      path: `/users/${encodePathSegment(userId)}/playlists/${encodePathSegment(kind)}/change`,
    });

    return Playlist.fromJSON(parseObjectResult(response));
  }

  async insertTrack(
    userId: UserId,
    kind: PlaylistKind,
    options: PlaylistInsertTrackOptions,
  ): Promise<Playlist> {
    return this.change(userId, kind, {
      diff: [
        createPlaylistInsertOperation(options.at ?? 0, [
          {
            albumId: options.albumId,
            id: options.trackId,
          },
        ]),
      ],
      revision: options.revision,
    });
  }

  async deleteTracks(
    userId: UserId,
    kind: PlaylistKind,
    options: PlaylistDeleteTracksOptions,
  ): Promise<Playlist> {
    return this.change(userId, kind, {
      diff: [createPlaylistDeleteOperation(options.from, options.to)],
      revision: options.revision,
    });
  }
}
