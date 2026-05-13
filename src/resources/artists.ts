import type { JsonObject } from "../core/json.ts";
import type { SupportedLanguage, HttpTransport } from "../http/types.ts";
import { parseYandexApiResponse } from "../http/response.ts";
import { Artist } from "../models/artist/Artist.ts";

export interface ArtistsByIdsOptions {
  readonly language?: SupportedLanguage;
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseArtists(value: unknown): readonly Artist[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isJsonObject).map((entry) => Artist.fromJSON(entry));
}

export class ArtistsResource {
  private readonly transport: HttpTransport;

  constructor(transport: HttpTransport) {
    this.transport = transport;
  }

  async byIds(
    artistIds: readonly (string | number)[],
    options: ArtistsByIdsOptions = {},
  ): Promise<readonly Artist[]> {
    const response = await this.transport.request({
      method: "GET",
      path: "/artists",
      query: {
        lang: options.language,
        "artist-ids": artistIds.join(","),
      },
    });

    return parseArtists(parseYandexApiResponse<unknown>(response));
  }

  async artists(
    artistIds: readonly (string | number)[],
    options: ArtistsByIdsOptions = {},
  ): Promise<readonly Artist[]> {
    return this.byIds(artistIds, options);
  }
}
