import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("model parity report documents report exclusions", async () => {
  const report = await readFile("docs/model-parity.md", "utf8");

  assert.match(report, /No resource endpoint coverage\./u);
  assert.match(report, /No write-method coverage/u);
  assert.match(report, /No device auth\./u);
  assert.match(report, /\| concert \|/u);
  assert.match(report, /\| metatag \|/u);
  assert.match(report, /\| wave \|/u);
});

test("model parity report does not document downloader APIs", async () => {
  const report = await readFile("docs/model-parity.md", "utf8");

  assert.doesNotMatch(report, /download\(\)|download_async\(\)|createWriteStream|arrayBuffer\(\)|blob\(\)/u);
});
