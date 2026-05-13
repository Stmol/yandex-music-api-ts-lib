import { mkdir, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

await rm("dist", { force: true, recursive: true });
await mkdir("dist", { recursive: true });

const tscPath = fileURLToPath(new URL("../node_modules/typescript/bin/tsc", import.meta.url));

const child = spawn(process.execPath, [tscPath, "-p", "tsconfig.build.json"], {
  stdio: "inherit",
});

const code = await new Promise((resolve) => child.on("exit", resolve));

if (code !== 0) {
  process.exit(Number(code));
}
