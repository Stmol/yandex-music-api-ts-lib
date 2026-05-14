import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const upstreamGroups = Object.freeze({
  account: 16,
  album: 6,
  artist: 25,
  clip: 2,
  concert: 16,
  experiment: 4,
  feed: 7,
  genre: 3,
  label: 3,
  landing: 16,
  metatag: 10,
  music_history: 8,
  pin: 3,
  playlist: 18,
  presave: 1,
  queue: 3,
  rotor: 13,
  search: 4,
  shot: 4,
  skeleton: 5,
  supplement: 3,
  track: 15,
  wave: 5,
});

const groupAliases = Object.freeze({
  history: "music_history",
  radio: "rotor",
  shared: "shared",
});

async function collectLocalModelGroups() {
  const root = path.resolve("src/models");
  const entries = await readdir(root, { withFileTypes: true });
  const groups = {};

  for (const entry of entries) {
    if (entry.isFile()) {
      continue;
    }

    const files = await readdir(path.join(root, entry.name), { withFileTypes: true });
    groups[groupAliases[entry.name] ?? entry.name] = files.filter((file) =>
      file.isFile() && file.name.endsWith(".ts")).length;
  }

  return groups;
}

function renderMarkdown(localGroups) {
  const lines = [
    "# Model Parity",
    "",
    "Reference: `MarshalX/yandex-music-api/yandex_music`.",
    "",
    "This report intentionally tracks read-only model coverage only. Resource endpoint coverage and write-method coverage are tracked in README.md and docs/LLM.md instead.",
    "",
    "| Group | Upstream Files | Local Files | v0.4 Status |",
    "| --- | ---: | ---: | --- |",
  ];

  for (const [group, upstreamCount] of Object.entries(upstreamGroups).sort(([left], [right]) =>
    left.localeCompare(right))) {
    const localCount = localGroups[group] ?? 0;
    const status = localCount >= upstreamCount
      ? "covered-or-expanded"
      : localCount > 0
        ? "partial"
        : "missing";
    lines.push(`| ${group} | ${upstreamCount} | ${localCount} | ${status} |`);
  }

  lines.push("");
  lines.push("## Report Exclusions");
  lines.push("");
  lines.push("- No resource endpoint coverage.");
  lines.push("- No write-method coverage, including the v0.5 playlists and likes/dislikes write subset.");
  lines.push("- No device auth.");
  lines.push("- No Ynison websocket clients.");
  lines.push("");

  return `${lines.join("\n")}\n`;
}

const localGroups = await collectLocalModelGroups();
const markdown = renderMarkdown(localGroups);

await writeFile("docs/model-parity.md", markdown);
console.log(markdown);
