import type { SupportedLanguage, HttpTransport } from "../http/types.ts";
import { Landing } from "../models/landing/Landing.ts";
import { parseObjectResult } from "./parsing.ts";

export interface LandingOptions {
  readonly language?: SupportedLanguage;
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
    return Landing.fromJSON(parseObjectResult(response));
  }
}
