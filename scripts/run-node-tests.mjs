import { readdir } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const testsRootDir = path.join(rootDir, ".tmp", "tests");
const argv = process.argv.slice(2);

function normalizePathForMatch(filePath) {
  return filePath.split(path.sep).join("/");
}

function collectFilterValues(flagName) {
  const values = [];

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === flagName) {
      const nextValue = argv[index + 1];

      if (!nextValue || nextValue.startsWith("--")) {
        throw new Error(`Missing value for ${flagName}.`);
      }

      values.push(nextValue);
      index += 1;
      continue;
    }

    if (argument.startsWith(`${flagName}=`)) {
      values.push(argument.slice(flagName.length + 1));
    }
  }

  return values;
}

function matchesGroup(filePath, groupName) {
  return normalizePathForMatch(filePath).includes(`/tests/${groupName}/`);
}

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
const includeGroups = collectFilterValues("--include");
const excludeGroups = collectFilterValues("--exclude");

const filteredTestFiles = testFiles.filter((filePath) => {
  if (includeGroups.length > 0 && !includeGroups.some((group) => matchesGroup(filePath, group))) {
    return false;
  }

  if (excludeGroups.some((group) => matchesGroup(filePath, group))) {
    return false;
  }

  return true;
});

if (filteredTestFiles.length === 0) {
  throw new Error(`No compiled Node test files found in ${testsRootDir}`);
}

const args = process.argv.includes("--coverage") ? ["--test", "--experimental-test-coverage"] : ["--test"];
const child = spawn(process.execPath, [...args, ...filteredTestFiles], {
  stdio: "inherit",
});

const { code, signal } = await new Promise((resolve, reject) => {
  child.on("error", reject);
  child.on("exit", (code, signal) => resolve({ code, signal }));
});

if (signal !== null) {
  console.error(`Node tests failed: test runner exited with signal ${signal}.`);
  process.exit(1);
}

if (code !== 0) {
  process.exit(code ?? 1);
}
