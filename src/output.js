import { randomUUID } from "node:crypto";
import {
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import {
  OUTPUT_MARKER,
  OUTPUT_MARKER_VERSION,
  PACKAGE_NAME,
  PACKAGE_VERSION,
} from "./constants.js";
import { YoloJsxError } from "./errors.js";

async function pathExists(value) {
  try {
    await readdir(value);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function hasValidMarker(output) {
  try {
    const marker = JSON.parse(await readFile(path.join(output, OUTPUT_MARKER), "utf8"));
    return marker?.tool === PACKAGE_NAME && marker?.formatVersion === OUTPUT_MARKER_VERSION;
  } catch (error) {
    if (error?.code === "ENOENT" || error instanceof SyntaxError) {
      return false;
    }
    throw error;
  }
}

export async function inspectOutput(output, force) {
  if (!(await pathExists(output))) {
    return { exists: false, managed: false, empty: true, forced: false };
  }

  const entries = await readdir(output);
  const empty = entries.length === 0;
  const managed = !empty && (await hasValidMarker(output));

  if (!empty && !managed && !force) {
    throw new YoloJsxError(
      `Output directory is not empty and is not managed by yolo-jsx: ${output}\nUse --force to replace it.`,
      { code: "UNOWNED_OUTPUT" },
    );
  }

  return { exists: true, managed, empty, forced: !empty && !managed && force };
}

export async function createOutputStage(output) {
  const parent = path.dirname(output);
  await mkdir(parent, { recursive: true });
  return mkdtemp(path.join(parent, ".yolojsx-stage-"));
}

export async function writeOutputMarker(stage) {
  const marker = {
    tool: PACKAGE_NAME,
    formatVersion: OUTPUT_MARKER_VERSION,
    packageVersion: PACKAGE_VERSION,
  };
  await writeFile(
    path.join(stage, OUTPUT_MARKER),
    `${JSON.stringify(marker, null, 2)}\n`,
    "utf8",
  );
}

export async function commitOutput(stage, output) {
  const outputExists = await pathExists(output);
  if (!outputExists) {
    await rename(stage, output);
    return;
  }

  const backup = `${output}.yolojsx-backup-${randomUUID()}`;
  await rename(output, backup);

  try {
    await rename(stage, output);
  } catch (error) {
    await rename(backup, output);
    throw error;
  }

  await rm(backup, { recursive: true, force: true });
}

export async function cleanupDirectory(directory) {
  if (directory) {
    await rm(directory, { recursive: true, force: true });
  }
}

export async function inspectFileOutput(output, force) {
  try {
    const outputStat = await lstat(output);
    if (outputStat.isDirectory()) {
      throw new YoloJsxError(`HTML output exists as a directory: ${output}`, {
        code: "INVALID_FILE_OUTPUT",
      });
    }
    if (!outputStat.isFile()) {
      throw new YoloJsxError(`HTML output is not a regular file: ${output}`, {
        code: "INVALID_FILE_OUTPUT",
      });
    }
    if (!force) {
      throw new YoloJsxError(
        `HTML output already exists: ${output}\nUse --force to replace it.`,
        { code: "FILE_OUTPUT_EXISTS" },
      );
    }
    return { exists: true, forced: true };
  } catch (error) {
    if (error?.code === "ENOENT") {
      return { exists: false, forced: false };
    }
    throw error;
  }
}

export async function commitFileOutput(contents, output) {
  const parent = path.dirname(output);
  const name = path.basename(output);
  await mkdir(parent, { recursive: true });

  const stage = path.join(parent, `.${name}.yolojsx-stage-${randomUUID()}`);
  const backup = path.join(parent, `.${name}.yolojsx-backup-${randomUUID()}`);
  let hasBackup = false;

  try {
    await writeFile(stage, contents, { encoding: "utf8", flag: "wx" });

    try {
      await rename(output, backup);
      hasBackup = true;
    } catch (error) {
      if (error?.code !== "ENOENT") {
        throw error;
      }
    }

    try {
      await rename(stage, output);
    } catch (error) {
      if (hasBackup) {
        await rename(backup, output);
        hasBackup = false;
      }
      throw error;
    }

    if (hasBackup) {
      await rm(backup, { force: true });
      hasBackup = false;
    }
  } finally {
    await rm(stage, { force: true });
    if (hasBackup) {
      try {
        await rename(backup, output);
      } catch {
        // Preserve the original publication error; recovery is best effort.
      }
    }
  }
}
