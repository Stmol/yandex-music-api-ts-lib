import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { Buffer } from "node:buffer";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import pkg from "../../package.json" with { type: "json" };

const execFileAsync = promisify(execFile);
const rootDir = path.resolve(import.meta.dirname, "..", "..", "..");

async function importDistModule(modulePath: string) {
  const module: unknown = await import(pathToFileURL(path.join(rootDir, modulePath)).href);

  assert.equal(typeof module, "object");
  assert.notEqual(module, null);

  return module as Record<string, unknown>;
}

async function listPackedFiles() {
  const packDir = await mkdtemp(path.join(tmpdir(), "ya-music-api-pack-"));
  const npmCacheDir = path.join(packDir, ".npm-cache");

  try {
    const { stdout } = await execFileAsync("npm", ["pack", "--json", "--pack-destination", packDir], {
      cwd: rootDir,
      env: {
        ...process.env,
        npm_config_cache: npmCacheDir,
      },
    });
    const [packResult] = JSON.parse(stdout) as Array<{ filename: string }>;

    assert.ok(packResult?.filename, "npm pack did not return a tarball filename");

    const tarballPath = path.join(packDir, packResult.filename);
    const tarball = await readFile(tarballPath);

    return await listTarEntries(tarball);
  } finally {
    await rm(packDir, { force: true, recursive: true });
  }
}

async function listTarEntries(tarball: Uint8Array): Promise<string[]> {
  const decompressed = await gunzipTarball(tarball);
  const files: string[] = [];

  for (let offset = 0; offset + 512 <= decompressed.length;) {
    const header = decompressed.subarray(offset, offset + 512);

    if (header.every((byte) => byte === 0)) {
      break;
    }

    const name = readTarString(header, 0, 100);
    const prefix = readTarString(header, 345, 155);
    const size = Number.parseInt(readTarString(header, 124, 12).trim() || "0", 8);

    files.push(prefix.length > 0 ? `${prefix}/${name}` : name);
    offset += 512 + Math.ceil(size / 512) * 512;
  }

  return files.sort((left, right) => left.localeCompare(right));
}

async function gunzipTarball(tarball: Uint8Array): Promise<Uint8Array> {
  const stream = new Response(new Blob([toArrayBuffer(tarball)])).body;

  assert.ok(stream, "Expected tarball response body");

  const decompressed = stream.pipeThrough(new DecompressionStream("gzip"));

  return new Uint8Array(await new Response(decompressed).arrayBuffer());
}

function readTarString(buffer: Uint8Array, offset: number, length: number): string {
  return Buffer.from(buffer.subarray(offset, offset + length))
    .toString("utf8")
    .replace(/\0.*$/u, "")
    .trim();
}

function toArrayBuffer(view: Uint8Array): ArrayBuffer {
  return Uint8Array.from(view).buffer;
}

test("package metadata matches the zero-dependency runtime contract", () => {
  assert.equal(pkg.type, "module");
  assert.deepEqual(pkg.files, ["dist", "README.md", "LICENSE"]);
  assert.deepEqual(pkg.dependencies ?? {}, {});
  assert.equal(pkg.sideEffects, false);
  assert.equal(pkg.license, "MIT");
  assert.deepEqual(Object.keys(pkg.exports).sort(), [".", "./models"]);
  assert.deepEqual(pkg.exports["."], {
    import: "./dist/index.js",
    types: "./dist/index.d.ts",
  });
  assert.deepEqual(pkg.exports["./models"], {
    import: "./dist/models/index.js",
    types: "./dist/models/index.d.ts",
  });
  assert.ok(pkg.engines.node);
  assert.ok(pkg.engines.bun);
  assert.equal(pkg.repository?.type, "git");
  assert.equal(pkg.bugs?.url, "https://github.com/Stmol/yandex-music-api-ts-lib/issues");
});

test("dist declarations follow the package export contract", async () => {
  const declarationFiles = [
    "dist/index.d.ts",
    "dist/models/index.d.ts",
  ];

  for (const declarationFile of declarationFiles) {
    const declaration = await readFile(path.join(rootDir, declarationFile), "utf8");

    assert.ok(declaration.length > 0, `${declarationFile} must be emitted`);
    assert.equal(declaration.includes("sourceMappingURL"), false, `${declarationFile} must not reference declaration maps`);
  }
});

test("root package imports representative v0.6 write helpers from dist", async () => {
  const root = await importDistModule(pkg.exports["."].import);

  assert.equal(typeof root.PlaylistDiffBuilder, "function");
  assert.equal(typeof root.serializePlaylistDiff, "function");
});

test("models subpath imports representative v0.4 read-only models from dist", async () => {
  const models = await importDistModule(pkg.exports["./models"].import);

  assert.equal(typeof models.Clip, "function");
  assert.equal(typeof models.Concert, "function");
  assert.equal(typeof models.Label, "function");
  assert.equal(typeof models.Metatag, "function");
  assert.equal(typeof models.Wave, "function");
  assert.equal(typeof models.Product, "function");
  assert.equal(typeof models.PlaylistTrailer, "function");
  assert.equal(typeof models.PlaylistRecommendations, "function");
  assert.equal(typeof models.ArtistClips, "function");
  assert.equal(typeof models.Block, "function");
  assert.equal(typeof models.Sequence, "function");
});

test("npm tarball contains the dist package surface", async () => {
  const files = await listPackedFiles();

  assert.ok(files.includes("package/dist/index.js"));
  assert.ok(files.includes("package/dist/index.d.ts"));
  assert.ok(files.includes("package/dist/models/index.js"));
  assert.ok(files.includes("package/dist/models/index.d.ts"));
  assert.ok(files.includes("package/package.json"));
  assert.equal(files.some((file) => file.endsWith(".d.ts.map")), false);
  assert.equal(files.some((file) => file.startsWith("package/src/")), false);
});
