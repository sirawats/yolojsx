import { spawnSync } from "node:child_process";

export const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

export function run(command, args, { cwd, env, expectedStatus = 0 } = {}) {
  const result = spawnSync(command, args, {
    cwd,
    env: { ...process.env, ...env },
    encoding: "utf8",
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== expectedStatus) {
    throw new Error(
      [
        `Command failed (${result.status}): ${command} ${args.join(" ")}`,
        result.stdout,
        result.stderr,
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }
  return result;
}

export function printResult(result) {
  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }
}
