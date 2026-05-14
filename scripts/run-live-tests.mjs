import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const liveFlag = process.env.YANDEX_MUSIC_LIVE?.trim().toLowerCase();
const liveEnabled = liveFlag === "1" || liveFlag === "true";

if (!liveEnabled) {
  console.error("Live tests are opt-in. Run with env YANDEX_MUSIC_LIVE=1 npm run test:live");
  process.exit(1);
}

const steps = [
  ["npm", ["run", "build"]],
  ["npm", ["run", "build:tests"]],
  ["node", ["scripts/run-node-tests.mjs", "--include", "live"]],
];

for (const [command, args] of steps) {
  const child = spawn(command, args, {
    cwd: rootDir,
    env: process.env,
    stdio: "inherit",
  });

  const { code, signal } = await new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("exit", (exitCode, exitSignal) => resolve({ code: exitCode, signal: exitSignal }));
  });

  if (signal !== null) {
    console.error(`Live tests command failed: ${command} exited with signal ${signal}.`);
    process.exit(1);
  }

  if (code !== 0) {
    process.exit(code ?? 1);
  }
}
