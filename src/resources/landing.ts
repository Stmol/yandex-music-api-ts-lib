import type { JsonObject } from "../core/json.ts";
import type { SupportedLanguage, HttpTransport } from "../http/types.ts";
import { parseYandexApiResponse } from "../http/response.ts";
import { Landing } from "../models/landing/Landing.ts";

export interface LandingOptions {
  readonly language?: SupportedLanguage;
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class LandingResource {
  private readonly transport: HttpTransport;

  constructor(transport: HttpTransport) {
    this.transport = transport;
  }

  async landing(blocks: readonly string[], options: LandingOptions = {}): Promise<Landing> {
    const response = await this.transport.request({
      method: "GET",
      path: "/landing3",
      query: {
        blocks: blocks.join(","),
        lang: options.language,
      },
    });
    const result = parseYandexApiResponse<unknown>(response);

    return Landing.fromJSON(isJsonObject(result) ? result : {});
  }
}
