import type { FetchTransportOptions } from "./http/fetch-transport.ts";
import type { HttpTransport } from "./http/types.ts";

export interface YandexMusicClientOptions
  extends Omit<FetchTransportOptions, "oauthToken"> {
  readonly oauthToken?: string;
  readonly transport?: HttpTransport;
}
