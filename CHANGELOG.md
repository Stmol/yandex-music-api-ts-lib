# Changelog

All notable changes to this project should be documented in this file.

The format is based on Keep a Changelog principles, with unreleased release notes prepared ahead of the actual tag.

## [1.0.0] - Unreleased

This entry documents the intended stable-release baseline. It does not mean the package has already been published as `1.0.0`.

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
