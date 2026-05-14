import type { YandexMusicClientOptions } from "./client-options.ts";
import type { FetchTransportOptions } from "./http/fetch-transport.ts";
import { FetchTransport } from "./http/fetch-transport.ts";
import type { HttpTransport } from "./http/types.ts";
import { AccountResource } from "./resources/account.ts";
import { AlbumsResource } from "./resources/albums.ts";
import { ArtistsResource } from "./resources/artists.ts";
import { GenresResource } from "./resources/genres.ts";
import { HistoryResource } from "./resources/history.ts";
import { LandingResource } from "./resources/landing.ts";
import { LikesResource } from "./resources/likes.ts";
import { PlaylistsResource } from "./resources/playlists.ts";
import { RadioResource } from "./resources/radio.ts";
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
    ...(options.enableHttpLogging !== undefined
      ? { enableHttpLogging: options.enableHttpLogging }
      : {}),
    ...(options.fetch !== undefined ? { fetch: options.fetch } : {}),
    ...(options.httpLogger !== undefined ? { httpLogger: options.httpLogger } : {}),
    ...(options.oauthToken !== undefined ? { oauthToken: options.oauthToken } : {}),
  };

  return new FetchTransport(transportOptions);
}

export class YandexMusicClient {
  readonly account: AccountResource;
  readonly albums: AlbumsResource;
  readonly artists: ArtistsResource;
  readonly genres: GenresResource;
  readonly history: HistoryResource;
  readonly landing: LandingResource;
  readonly likes: LikesResource;
  readonly playlists: PlaylistsResource;
  readonly radio: RadioResource;
  readonly search: SearchResource;
  readonly tracks: TracksResource;

  constructor(options: YandexMusicClientOptions = {}) {
    const transport = resolveTransport(options);

    this.account = new AccountResource(transport);
    this.albums = new AlbumsResource(transport);
    this.artists = new ArtistsResource(transport);
    this.genres = new GenresResource(transport);
    this.history = new HistoryResource(transport);
    this.landing = new LandingResource(transport);
    this.likes = new LikesResource(transport);
    this.playlists = new PlaylistsResource(transport);
    this.radio = new RadioResource(transport);
    this.search = new SearchResource(transport);
    this.tracks = new TracksResource(transport);

    Object.freeze(this);
  }
}
