import type { HttpTransport, SupportedLanguage } from "../http/types.ts";
import { MusicHistory } from "../models/history/MusicHistory.ts";
import { parseObjectResult } from "./parsing.ts";

export interface MusicHistoryOptions {
  readonly fullModelsCount?: number;
  readonly language?: SupportedLanguage;
}

export class HistoryResource {
  private readonly transport: HttpTransport;

  constructor(transport: HttpTransport) {
    this.transport = transport;
  }

  async musicHistory(options: MusicHistoryOptions = {}): Promise<MusicHistory> {
    const response = await this.transport.request({
      method: "GET",
      path: "/music-history",
      query: {
        fullModelsCount: options.fullModelsCount,
        lang: options.language,
      },
    });

    return MusicHistory.fromJSON(parseObjectResult(response));
  }
}
