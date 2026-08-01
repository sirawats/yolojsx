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
import { formatError, hasErrorCode, RtifactError } from "./errors.js";

async function pathExists(value: string) {
  try {
    await readdir(value);
    return true;
  } catch (error) {
    if (hasErrorCode(error, "ENOENT")) {
      return false;
    }
    throw error;
  }
}

async function hasValidMarker(output: string) {
  try {
    const marker: unknown = JSON.parse(
      await readFile(path.join(output, OUTPUT_MARKER), "utf8"),
    );
    return (
      typeof marker === "object" &&
      marker !== null &&
      "tool" in marker &&
      marker.tool === PACKAGE_NAME &&
      "formatVersion" in marker &&
      marker.formatVersion === OUTPUT_MARKER_VERSION
    );
  } catch (error) {
    if (hasErrorCode(error, "ENOENT") || error instanceof SyntaxError) {
      return false;
    }
    throw error;
  }
}

export async function inspectOutput(output: string, force: boolean) {
  if (!(await pathExists(output))) {
    return { exists: false, managed: false, empty: true, forced: false };
  }

  const entries = await readdir(output);
  const empty = entries.length === 0;
  const managed = !empty && (await hasValidMarker(output));

  if (!empty && !managed && !force) {
    throw new RtifactError(
      `Output directory is not empty and is not managed by Rtifact: ${output}\nUse --force to replace it.`,
      { code: "UNOWNED_OUTPUT" },
    );
  }

  return {
    exists: true,
    managed,
    empty,
    unowned: !empty && !managed,
    forced: !empty && !managed && force,
  };
}

export async function createOutputStage(output: string) {
  const parent = path.dirname(output);
  await mkdir(parent, { recursive: true });
  return mkdtemp(path.join(parent, ".rtifact-stage-"));
}

export async function writeOutputMarker(stage: string) {
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

export async function commitOutput(stage: string, output: string) {
  const outputExists = await pathExists(output);
  if (!outputExists) {
    await rename(stage, output);
    return;
  }

  const backup = `${output}.rtifact-backup-${randomUUID()}`;
  await rename(output, backup);

  try {
    await rename(stage, output);
  } catch (error) {
    await rename(backup, output);
    throw error;
  }

  await rm(backup, { recursive: true, force: true });
}

export async function cleanupDirectory(directory?: string, failure?: Error) {
  if (!directory) {
    return;
  }

  try {
    await rm(directory, { recursive: true, force: true });
  } catch (cleanupError) {
    if (!failure) {
      throw cleanupError;
    }
    failure.message += `\nCleanup also failed: ${formatError(cleanupError)}`;
  }
}

export async function inspectFileOutput(output: string, force: boolean) {
  try {
    const outputStat = await lstat(output);
    if (outputStat.isDirectory()) {
      throw new RtifactError(`HTML output exists as a directory: ${output}`, {
        code: "INVALID_FILE_OUTPUT",
      });
    }
    if (!outputStat.isFile()) {
      throw new RtifactError(`HTML output is not a regular file: ${output}`, {
        code: "INVALID_FILE_OUTPUT",
      });
    }
    if (!force) {
      throw new RtifactError(
        `HTML output already exists: ${output}\nUse --force to replace it.`,
        { code: "FILE_OUTPUT_EXISTS" },
      );
    }
    return { exists: true, forced: true };
  } catch (error) {
    if (hasErrorCode(error, "ENOENT")) {
      return { exists: false, forced: false };
    }
    throw error;
  }
}

export async function commitFileOutput(contents: string, output: string) {
  const parent = path.dirname(output);
  const name = path.basename(output);
  await mkdir(parent, { recursive: true });

  const stage = path.join(parent, `.${name}.rtifact-stage-${randomUUID()}`);
  const backup = path.join(parent, `.${name}.rtifact-backup-${randomUUID()}`);
  let hasBackup = false;

  try {
    await writeFile(stage, contents, { encoding: "utf8", flag: "wx" });

    try {
      await rename(output, backup);
      hasBackup = true;
    } catch (error) {
      if (!hasErrorCode(error, "ENOENT")) {
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
