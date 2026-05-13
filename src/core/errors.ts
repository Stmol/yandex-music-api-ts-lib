export interface YandexMusicErrorOptions {
  readonly cause?: unknown;
  readonly details?: unknown;
  readonly status?: number;
  readonly url?: string;
}

export class YandexMusicError extends Error {
  declare readonly cause: unknown;
  readonly details: unknown;
  readonly status: number | undefined;
  readonly url: string | undefined;

  constructor(message: string, options: YandexMusicErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = new.target.name;
    this.details = options.details;
    this.status = options.status;
    this.url = options.url;
  }
}

export class TimeoutError extends YandexMusicError {}

export class AbortError extends YandexMusicError {}

export class NetworkError extends YandexMusicError {}

export class BadRequestError extends YandexMusicError {}

export class UnauthorizedError extends YandexMusicError {}

export class NotFoundError extends YandexMusicError {}

export class UnknownApiError extends YandexMusicError {}
