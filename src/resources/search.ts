import type { JsonObject } from "../core/json.ts";
import type { SupportedLanguage, HttpTransport } from "../http/types.ts";
import { parseYandexApiResponse } from "../http/response.ts";
import { Search } from "../models/search/Search.ts";

export type SearchType = "all" | "album" | "artist" | "playlist" | "track";

export interface SearchOptions {
  readonly language?: SupportedLanguage;
  readonly nocorrect?: boolean;
  readonly page?: number;
  readonly pageSize?: number;
  readonly playlistInBest?: boolean;
  readonly type?: SearchType;
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class SearchResource {
  private readonly transport: HttpTransport;

  constructor(transport: HttpTransport) {
    this.transport = transport;
  }

  async search(text: string, options: SearchOptions = {}): Promise<Search> {
    const response = await this.transport.request({
      method: "GET",
      path: "/search",
      query: {
        lang: options.language,
        text,
        type: options.type,
        nocorrect: options.nocorrect,
        page: options.page,
        "page-size": options.pageSize,
        "playlist-in-best": options.playlistInBest,
      },
    });
    const result = parseYandexApiResponse<unknown>(response);

    return Search.fromJSON(isJsonObject(result) ? result : {});
  }
}
