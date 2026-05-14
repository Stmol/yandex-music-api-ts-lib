# Changelog

All notable changes to this project should be documented in this file.

The format is based on Keep a Changelog principles.

## [1.1.0] - 2026-05-14

### Changed

- clarified installation instructions in `README.md` for all supported runtimes: Node.js, Bun, and Deno
- documented the Deno `npm:` import path alongside the install command to match actual consumer usage

## [1.0.0] - 2026-05-14

### Added

- explicit runtime compatibility policy for Node.js, Bun, Deno, and browser-like environments
- explicit error and transport contract documentation
- explicit semantic compatibility policy for the public package surface
- explicit release process documentation

### Changed

- aligned README and LLM-facing docs with the implemented fetch, retry, timeout, and error behavior
- clarified that the package is ESM-only and that browser support is best-effort rather than release-gated
- clarified the stable runtime baseline and the distinction between supported, verified, and best-effort environments

### Stable Surface At 1.0.0

- root entrypoint: `ya-music-api-ts-lib`
- models entrypoint: `ya-music-api-ts-lib/models`
- immutable `YandexMusicClient` resource groups
- typed error hierarchy
- built-in fetch transport with injectable override points
