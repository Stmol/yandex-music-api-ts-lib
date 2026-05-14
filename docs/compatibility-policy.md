# Compatibility Policy

This document defines what `ya-music-api-ts-lib` intends to keep stable starting with `v1.0.0`.

## Versioning

The package follows semantic versioning after `v1.0.0`.

- patch releases fix bugs and documentation without changing the public contract
- minor releases add backward-compatible API surface
- major releases may remove or change existing public behavior

## Stable Public Surface

The following are part of the stable contract:

- package entrypoints `ya-music-api-ts-lib` and `ya-music-api-ts-lib/models`
- exported TypeScript types, classes, and functions from those entrypoints
- `YandexMusicClient` resource names
- documented constructor options
- documented transport and error behavior
- published runtime baselines for Node.js and Bun

## Non-Public Surface

The following are not public API and may change in any release:

- internal file layout under `src/`
- undocumented imports from deep paths
- implementation details of parsing helpers
- undocumented model fields added only because the upstream API sent them through
- test-only utilities and build scripts

## Model Compatibility

Model policy for `v1.x`:

- existing documented top-level camelCase fields should not be renamed or removed outside a major release
- fields may remain optional even when they often exist in practice
- new optional fields may be added in minor releases
- nested parsing may become more specific over time when a raw object starts mapping to a known model class

That last point is intentionally non-breaking for typed consumers, but integrations that rely on exact prototype identity of previously raw nested objects should avoid that assumption.

## Resource Compatibility

For `v1.x`:

- existing method names should remain stable
- adding new optional parameters is allowed in minor releases
- tightening a parameter from optional to required is breaking
- changing a return type in a way that removes previously reachable fields is breaking
- adding new resource groups or methods is non-breaking

## Runtime Compatibility

For `v1.x`:

- Node.js `>=22` and Bun `>=1.1` are the stable runtime baseline
- Deno compatibility remains best-effort unless it is promoted into `package.json#engines`
- browser compatibility remains best-effort until browser CI becomes part of the release gate

Raising the stable runtime floor is a breaking change unless the prior runtime is already outside the documented support window.

## Error Compatibility

For `v1.x`:

- exported error class names are stable
- documented retry, timeout, and status-mapping defaults are stable
- additional `details` payload content may appear in minor releases

Consumers should branch on exported class types rather than exact message strings.
