import type { HttpTransport, SupportedLanguage } from "../http/types.ts";
import { Genre } from "../models/genre/Genre.ts";
import { parseObjectArrayResult } from "./parsing.ts";

export interface GenresListOptions {
  readonly language?: SupportedLanguage;
}

export class GenresResource {
  private readonly transport: HttpTransport;

  constructor(transport: HttpTransport) {
    this.transport = transport;
  }

  async list(options: GenresListOptions = {}): Promise<readonly Genre[]> {
    const response = await this.transport.request({
      method: "GET",
      path: "/genres",
      query: {
        lang: options.language,
      },
    });

    return parseObjectArrayResult(response, (entry) => Genre.fromJSON(entry));
  }
}
