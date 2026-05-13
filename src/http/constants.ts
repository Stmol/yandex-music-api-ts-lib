export const YANDEX_MUSIC_API_BASE_URL = "https://api.music.yandex.net";

export const DEFAULT_HEADERS = {
  Accept: "application/json",
} as const;

export const SUPPORTED_LANGUAGES = ["ru", "en", "uk", "kk", "be"] as const;

export const DEFAULT_TIMEOUT_MS = 10_000;

export const DEFAULT_RETRY_MAX_RETRIES = 2;

export const DEFAULT_RETRY_BASE_DELAY_MS = 250;

export const DEFAULT_RETRY_MAX_DELAY_MS = 2_000;

export const DEFAULT_RETRY_METHODS = ["GET"] as const;

export const DEFAULT_RETRY_STATUSES = [408, 425, 429, 500, 502, 503, 504] as const;
