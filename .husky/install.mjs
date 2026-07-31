if (
  process.env.CI === "true" ||
  process.env.NODE_ENV === "production" ||
  ["pack", "publish"].includes(process.env.npm_command ?? "")
) {
  process.exit(0);
}

const husky = (await import("husky")).default;
const message = husky();
if (message) {
  process.stderr.write(`${message}\n`);
}
