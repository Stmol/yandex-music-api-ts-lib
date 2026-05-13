import test from "node:test";
import assert from "node:assert/strict";
import pkg from "../../package.json" with { type: "json" };

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
