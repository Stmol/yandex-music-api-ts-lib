# Model Parity

Reference: `MarshalX/yandex-music-api/yandex_music`.

This report intentionally tracks read-only model coverage only. Resource endpoint coverage and write-method coverage are tracked in README.md and docs/LLM.md instead.

| Group | Upstream Files | Local Files | v0.4 Status |
| --- | ---: | ---: | --- |
| account | 16 | 15 | partial |
| album | 6 | 5 | partial |
| artist | 25 | 25 | covered-or-expanded |
| clip | 2 | 2 | covered-or-expanded |
| concert | 16 | 16 | covered-or-expanded |
| experiment | 4 | 0 | missing |
| feed | 7 | 7 | covered-or-expanded |
| genre | 3 | 1 | partial |
| label | 3 | 3 | covered-or-expanded |
| landing | 16 | 17 | covered-or-expanded |
| metatag | 10 | 10 | covered-or-expanded |
| music_history | 8 | 8 | covered-or-expanded |
| pin | 3 | 0 | missing |
| playlist | 18 | 17 | partial |
| presave | 1 | 0 | missing |
| queue | 3 | 1 | partial |
| rotor | 13 | 11 | partial |
| search | 4 | 2 | partial |
| shot | 4 | 4 | covered-or-expanded |
| skeleton | 5 | 5 | covered-or-expanded |
| supplement | 3 | 0 | missing |
| track | 15 | 16 | covered-or-expanded |
| wave | 5 | 5 | covered-or-expanded |

## Report Exclusions

- No resource endpoint coverage.
- No write-method coverage, including the v0.6 playlists and likes/dislikes write subset.
- No device auth.
- No Ynison websocket clients.
