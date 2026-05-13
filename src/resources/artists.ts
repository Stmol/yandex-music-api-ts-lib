import { joinIds, type ArtistId } from "../core/identifiers.ts";
import type { SupportedLanguage, HttpTransport } from "../http/types.ts";
import { Artist } from "../models/artist/Artist.ts";
import { parseObjectArrayResult } from "./parsing.ts";

export interface ArtistsByIdsOptions {
  readonly language?: SupportedLanguage;
}

export class ArtistsResource {
  private readonly transport: HttpTransport;

  constructor(transport: HttpTransport) {
    this.transport = transport;
  }

  async byIds(
    artistIds: readonly ArtistId[],
    options: ArtistsByIdsOptions = {},
  ): Promise<readonly Artist[]> {
    const response = await this.transport.request({
      method: "GET",
      path: "/artists",
      query: {
        lang: options.language,
        "artist-ids": joinIds(artistIds),
      },
    });

    return parseObjectArrayResult(response, (entry) => Artist.fromJSON(entry));
  }
}
