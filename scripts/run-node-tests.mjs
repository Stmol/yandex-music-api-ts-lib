import { readdir } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const testsRootDir = path.join(rootDir, ".tmp", "tests");

async function collectTestFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectTestFiles(entryPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".test.js")) {
      files.push(entryPath);
    }
  }

  return files.sort((left, right) => left.localeCompare(right));
}

const testFiles = await collectTestFiles(testsRootDir);

if (testFiles.length === 0) {
  throw new Error(`No compiled Node test files found in ${testsRootDir}`);
}

const args = process.argv.includes("--coverage") ? ["--test", "--experimental-test-coverage"] : ["--test"];
const child = spawn(process.execPath, [...args, ...testFiles], {
  stdio: "inherit",
});

const code = await new Promise((resolve) => child.on("exit", resolve));

if (code !== 0) {
  process.exit(Number(code));
}
