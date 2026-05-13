import type { JsonObject } from "../core/json.ts";
import type { SupportedLanguage, HttpTransport } from "../http/types.ts";
import { parseYandexApiResponse } from "../http/response.ts";
import { Playlist } from "../models/playlist/Playlist.ts";

export interface PlaylistListOptions {
  readonly language?: SupportedLanguage;
}

export interface PlaylistGetOptions {
  readonly language?: SupportedLanguage;
  readonly richTracks?: boolean;
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parsePlaylists(value: unknown): readonly Playlist[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isJsonObject).map((entry) => Playlist.fromJSON(entry));
}

export class PlaylistsResource {
  private readonly transport: HttpTransport;

  constructor(transport: HttpTransport) {
    this.transport = transport;
  }

  async list(
    userId: string | number,
    options: PlaylistListOptions = {},
  ): Promise<readonly Playlist[]> {
    const response = await this.transport.request({
      method: "GET",
      path: `/users/${encodeURIComponent(String(userId))}/playlists/list`,
      query: {
        lang: options.language,
      },
    });

    return parsePlaylists(parseYandexApiResponse<unknown>(response));
  }

  async usersPlaylistsList(
    userId: string | number,
    options: PlaylistListOptions = {},
  ): Promise<readonly Playlist[]> {
    return this.list(userId, options);
  }

  async get(
    userId: string | number,
    kind: string | number,
    options: PlaylistGetOptions = {},
  ): Promise<Playlist> {
    const response = await this.transport.request({
      method: "GET",
      path: `/users/${encodeURIComponent(String(userId))}/playlists/${encodeURIComponent(String(kind))}`,
      query: {
        lang: options.language,
        "rich-tracks": options.richTracks,
      },
    });
    const result = parseYandexApiResponse<unknown>(response);

    return Playlist.fromJSON(isJsonObject(result) ? result : {});
  }

  async usersPlaylists(
    userId: string | number,
    kind: string | number,
    options: PlaylistGetOptions = {},
  ): Promise<Playlist> {
    return this.get(userId, kind, options);
  }
}
