import { encodePathSegment, type PlaylistKind, type UserId } from "../core/identifiers.ts";
import type { SupportedLanguage, HttpTransport } from "../http/types.ts";
import { Playlist } from "../models/playlist/Playlist.ts";
import { parseObjectArrayResult, parseObjectResult } from "./parsing.ts";

export interface PlaylistListOptions {
  readonly language?: SupportedLanguage;
}

export interface PlaylistGetOptions {
  readonly language?: SupportedLanguage;
  readonly richTracks?: boolean;
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
}
