import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { Buffer } from "node:buffer";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import pkg from "../../package.json" with { type: "json" };
import {
  combineExpectedExportNames,
  MODELS_DECLARATION_ONLY_EXPORTS,
  MODELS_RUNTIME_EXPORTS,
  readDeclarationExportNames,
  readRuntimeExportNames,
  ROOT_DECLARATION_ONLY_EXPORTS,
  ROOT_RUNTIME_ONLY_EXPORTS,
} from "./export-surface.ts";

const execFileAsync = promisify(execFile);
const rootDir = path.resolve(import.meta.dirname, "..", "..", "..");
const expectedModelsDeclarationExports = combineExpectedExportNames(
  MODELS_RUNTIME_EXPORTS,
  MODELS_DECLARATION_ONLY_EXPORTS,
);
const expectedRootRuntimeExports = combineExpectedExportNames(
  MODELS_RUNTIME_EXPORTS,
  ROOT_RUNTIME_ONLY_EXPORTS,
);
const expectedRootDeclarationExports = combineExpectedExportNames(
  expectedModelsDeclarationExports,
  ROOT_DECLARATION_ONLY_EXPORTS,
);

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
  assert.deepEqual(
    Object.values(pkg.exports).map((entry) => Object.keys(entry).sort()),
    [["import", "types"], ["import", "types"]],
  );
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

test("root package runtime exports stay frozen", async () => {
  const runtimeExports = await readRuntimeExportNames(rootDir, pkg.exports["."].import);

  assert.deepEqual(runtimeExports, expectedRootRuntimeExports);
});

test("models subpath runtime exports stay frozen", async () => {
  const runtimeExports = await readRuntimeExportNames(rootDir, pkg.exports["./models"].import);

  assert.deepEqual(runtimeExports, combineExpectedExportNames(MODELS_RUNTIME_EXPORTS));
});

test("root package declaration exports stay frozen", () => {
  const declarationExports = readDeclarationExportNames(rootDir, pkg.exports["."].types);

  assert.deepEqual(declarationExports, expectedRootDeclarationExports);
});

test("models subpath declaration exports stay frozen", () => {
  const declarationExports = readDeclarationExportNames(rootDir, pkg.exports["./models"].types);

  assert.deepEqual(declarationExports, expectedModelsDeclarationExports);
});

test("runtime exports remain a subset of declaration exports", async () => {
  const rootRuntimeExports = await readRuntimeExportNames(rootDir, pkg.exports["."].import);
  const modelRuntimeExports = await readRuntimeExportNames(rootDir, pkg.exports["./models"].import);
  const rootDeclarationExports = readDeclarationExportNames(rootDir, pkg.exports["."].types);
  const modelDeclarationExports = readDeclarationExportNames(rootDir, pkg.exports["./models"].types);

  assert.deepEqual(rootRuntimeExports.filter((name) => !rootDeclarationExports.includes(name)), []);
  assert.deepEqual(modelRuntimeExports.filter((name) => !modelDeclarationExports.includes(name)), []);
});

test("npm tarball contains the export-targeted package surface only", async () => {
  const files = await listPackedFiles();
  const exportTargets = Object.values(pkg.exports)
    .flatMap((entry) => [entry.import, entry.types])
    .map((file) => `package/${file.replace(/^\.\//u, "")}`);

  for (const exportTarget of exportTargets) {
    assert.ok(files.includes(exportTarget), `Expected tarball to include ${exportTarget}`);
  }

  assert.ok(files.includes("package/package.json"));
  assert.ok(files.includes("package/README.md"));
  assert.ok(files.includes("package/LICENSE"));
  assert.equal(files.some((file) => file.endsWith(".d.ts.map")), false);
  assert.equal(files.some((file) => file.endsWith(".js.map")), false);
  assert.equal(files.some((file) => file.endsWith(".ts") && !file.endsWith(".d.ts")), false);
  assert.equal(files.some((file) => file.startsWith("package/src/")), false);
  assert.equal(files.some((file) => file.startsWith("package/tests/")), false);
  assert.equal(files.some((file) => file.startsWith("package/scripts/")), false);
  assert.equal(files.some((file) => file.startsWith("package/.tmp/")), false);
});
