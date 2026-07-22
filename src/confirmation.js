import process from "node:process";
import { createInterface } from "node:readline";
import { YoloJsxError } from "./errors.js";

export async function confirmReplacement(
  target,
  { input = process.stdin, output = process.stderr } = {},
) {
  if (!input?.isTTY) {
    throw new YoloJsxError(
      `Output already exists and confirmation is unavailable in a non-interactive session: ${target}\nUse --force to replace it.`,
      { code: "CONFIRMATION_REQUIRED" },
    );
  }

  const lines = createInterface({ input, crlfDelay: Infinity });
  output.write(`Output already exists: ${target}\nReplace it? Type yes or no: `);

  try {
    for await (const line of lines) {
      const answer = line.trim().toLowerCase();
      if (answer === "yes") {
        return true;
      }
      if (answer === "no") {
        return false;
      }
      output.write("Please type yes or no: ");
    }
  } finally {
    lines.close();
  }

  throw new YoloJsxError(
    `Confirmation ended before yes or no was entered; output was not changed: ${target}`,
    { code: "CONFIRMATION_REQUIRED" },
  );
}
