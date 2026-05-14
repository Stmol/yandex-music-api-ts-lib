# Release Process

This document describes the release path used for `v1.0.0` and later maintenance releases.

## Scope

A release is considered ready only when:

- package metadata matches the intended public contract
- docs and policy files match the implemented runtime behavior
- smoke tests pass for the declared runtimes
- the changelog is updated for the release being cut

## Local Validation

Run the full local gate before cutting a tag:

```fish
npm ci
npm run lint
npm run check:types
npm run check:dead-code
npm run test:node
npm run test:meta
npm run test:bun
npm run test:deno
npm pack --dry-run
```

Opt-in live checks are separate from the default gate:

```fish
set -x YANDEX_MUSIC_LIVE 1
set -x YANDEX_MUSIC_OAUTH_TOKEN <oauth-token>
npm run test:live
```

Optional mutation smoke for a dedicated test account:

```fish
set -x YANDEX_MUSIC_LIVE_MUTATION 1
set -x YANDEX_MUSIC_TEST_USER_ID <uid>
npm run test:live
```

## CI Release Gate

The repository workflow runs on:

- pull requests
- branch pushes
- tags matching `v*`

The release gate currently verifies:

- lint
- typecheck
- dead-code check
- Node tests
- package-contract tests
- Bun smoke tests
- Deno smoke tests
- `npm pack --dry-run`

Manual release confidence gate:

- workflow dispatch for `.github/workflows/live-tests.yml`
- opt-in live read checks
- optional playlist create/delete mutation smoke when the dedicated test env is provided

## Tagging

The intended release flow is:

1. update `CHANGELOG.md` for the target version
2. ensure `package.json#version` matches the target release
3. run the local validation gate
4. run `npm run test:live` locally or trigger the manual live workflow when release confidence against the real API is required
5. push the release commit
6. create and push a tag in the form `v<version>`
7. verify the tag-triggered CI run is green
8. publish to npm only after the tag build is confirmed

## v1.0.0 Release Notes

`v1.0.0` release readiness required the following:

- runtime and browser support docs are explicit
- error and transport contract docs match the implementation
- compatibility policy is published
- release process is written down
- changelog entry for `v1.0.0` is prepared

The repository is versioned for `1.0.0`. If the worktree is clean and the validation gate is green, it is ready for the release tag and push flow above.
