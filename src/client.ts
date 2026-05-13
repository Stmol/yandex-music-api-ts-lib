import type { YandexMusicClientOptions } from "./client-options.ts";
import type { FetchTransportOptions } from "./http/fetch-transport.ts";
import { FetchTransport } from "./http/fetch-transport.ts";
import type { HttpTransport } from "./http/types.ts";
import { AccountResource } from "./resources/account.ts";
import { ArtistsResource } from "./resources/artists.ts";
import { LandingResource } from "./resources/landing.ts";
import { PlaylistsResource } from "./resources/playlists.ts";
import { SearchResource } from "./resources/search.ts";
import { TracksResource } from "./resources/tracks.ts";

function resolveTransport(options: YandexMusicClientOptions): HttpTransport {
  if (options.transport) {
    return options.transport;
  }

  const transportOptions: FetchTransportOptions = {
    ...(options.baseUrl !== undefined ? { baseUrl: options.baseUrl } : {}),
    ...(options.defaultHeaders !== undefined
      ? { defaultHeaders: options.defaultHeaders }
      : {}),
    ...(options.defaultRetry !== undefined ? { defaultRetry: options.defaultRetry } : {}),
    ...(options.defaultTimeoutMs !== undefined
      ? { defaultTimeoutMs: options.defaultTimeoutMs }
      : {}),
    ...(options.fetch !== undefined ? { fetch: options.fetch } : {}),
    ...(options.oauthToken !== undefined ? { oauthToken: options.oauthToken } : {}),
  };

  return new FetchTransport(transportOptions);
}

export class YandexMusicClient {
  readonly account: AccountResource;
  readonly artists: ArtistsResource;
  readonly landing: LandingResource;
  readonly playlists: PlaylistsResource;
  readonly search: SearchResource;
  readonly tracks: TracksResource;

  constructor(options: YandexMusicClientOptions = {}) {
    const transport = resolveTransport(options);

    this.account = new AccountResource(transport);
    this.artists = new ArtistsResource(transport);
    this.landing = new LandingResource(transport);
    this.playlists = new PlaylistsResource(transport);
    this.search = new SearchResource(transport);
    this.tracks = new TracksResource(transport);

    Object.freeze(this);
  }
}
