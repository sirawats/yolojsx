import { randomUUID } from "node:crypto";
import {
  lstat,
  mkdir,
  mkdtemp,
  opendir,
  readdir,
  realpath,
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
import { readStableFile, StableFileError } from "./stable-files.js";
import { BUILD_RESOURCE_LIMITS } from "./resource-limits.js";

export interface OutputAuthorization {
  exists: boolean;
  device?: bigint;
  inode?: bigint;
  canonicalPath: string;
}

export interface PublicationOperations {
  rename: typeof rename;
  rm: typeof rm;
}

const defaultPublicationOperations: PublicationOperations = { rename, rm };

function reportRecoveryFailure(
  publicationError: unknown,
  recoveryError: unknown,
  backup: string,
) {
  if (publicationError instanceof Error) {
    publicationError.message += `\nBackup recovery also failed: ${formatError(recoveryError)}\nRecoverable backup: ${backup}`;
  }
}

async function canonicalizePotentialPath(value: string) {
  const missing: string[] = [];
  let current = value;

  while (true) {
    try {
      const resolved = await realpath(current);
      return path.join(resolved, ...missing.reverse());
    } catch (error) {
      if (!hasErrorCode(error, "ENOENT")) throw error;
      const parent = path.dirname(current);
      if (parent === current) return value;
      missing.push(path.basename(current));
      current = parent;
    }
  }
}

async function captureOutputAuthorization(
  output: string,
): Promise<OutputAuthorization> {
  try {
    const outputStat = await lstat(output, { bigint: true });
    return {
      exists: true,
      device: outputStat.dev,
      inode: outputStat.ino,
      canonicalPath: await canonicalizePotentialPath(output),
    };
  } catch (error) {
    if (hasErrorCode(error, "ENOENT")) {
      return {
        exists: false,
        canonicalPath: await canonicalizePotentialPath(output),
      };
    }
    throw error;
  }
}

async function assertOutputAuthorization(
  output: string,
  authorized: OutputAuthorization,
) {
  const current = await captureOutputAuthorization(output);
  if (
    current.exists !== authorized.exists ||
    current.device !== authorized.device ||
    current.inode !== authorized.inode ||
    current.canonicalPath !== authorized.canonicalPath
  ) {
    throw new RtifactError(
      `Output changed after it was authorized; refusing to replace it: ${output}`,
      { code: "OUTPUT_CHANGED" },
    );
  }
}

async function hasValidMarker(output: string) {
  try {
    const markerPath = path.join(output, OUTPUT_MARKER);
    const markerText = (await readStableFile(markerPath, 4096)).toString(
      "utf8",
    );
    const marker: unknown = JSON.parse(markerText);
    return (
      typeof marker === "object" &&
      marker !== null &&
      "tool" in marker &&
      marker.tool === PACKAGE_NAME &&
      "formatVersion" in marker &&
      marker.formatVersion === OUTPUT_MARKER_VERSION
    );
  } catch (error) {
    if (
      hasErrorCode(error, "ENOENT") ||
      error instanceof SyntaxError ||
      error instanceof StableFileError
    ) {
      return false;
    }
    throw error;
  }
}

export async function inspectOutput(output: string, force: boolean) {
  const authorization = await captureOutputAuthorization(output);
  if (!authorization.exists) {
    return {
      exists: false,
      managed: false,
      empty: true,
      forced: false,
      authorization,
    };
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
    authorization,
  };
}

export async function createOutputStage(
  output: string,
  authorization: OutputAuthorization,
) {
  await assertOutputAuthorization(output, authorization);
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

export async function commitOutput(
  stage: string,
  output: string,
  authorization: OutputAuthorization,
  operations: PublicationOperations = defaultPublicationOperations,
) {
  const backup = `${output}.rtifact-backup-${randomUUID()}`;
  await publishAuthorizedStage(
    stage,
    output,
    backup,
    authorization,
    operations,
    true,
  );
}

async function publishAuthorizedStage(
  stage: string,
  output: string,
  backup: string,
  authorization: OutputAuthorization,
  operations: PublicationOperations,
  recursiveBackup: boolean,
) {
  await assertOutputAuthorization(output, authorization);
  if (!authorization.exists) {
    await operations.rename(stage, output);
    return;
  }
  await operations.rename(output, backup);
  try {
    await operations.rename(stage, output);
  } catch (error) {
    try {
      await operations.rename(backup, output);
    } catch (recoveryError) {
      reportRecoveryFailure(error, recoveryError, backup);
    }
    throw error;
  }
  await operations.rm(backup, {
    ...(recursiveBackup ? { recursive: true } : {}),
    force: true,
  });
}

export async function cleanupDirectory(
  directory?: string,
  failure?: Error,
  remove: typeof rm = rm,
) {
  if (!directory) {
    return;
  }

  try {
    await remove(directory, {
      recursive: true,
      force: true,
      maxRetries: 3,
      retryDelay: 100,
    });
  } catch (cleanupError) {
    if (!failure) {
      throw cleanupError;
    }
    failure.message += `\nCleanup also failed: ${formatError(cleanupError)}`;
  }
}

export async function inspectFileOutput(output: string, force: boolean) {
  const authorization = await captureOutputAuthorization(output);
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
    return { exists: true, forced: true, authorization };
  } catch (error) {
    if (hasErrorCode(error, "ENOENT")) {
      return { exists: false, forced: false, authorization };
    }
    throw error;
  }
}

export async function commitFileOutput(
  contents: string,
  output: string,
  authorization: OutputAuthorization,
  operations: PublicationOperations = defaultPublicationOperations,
) {
  const parent = path.dirname(output);
  const name = path.basename(output);
  await assertOutputAuthorization(output, authorization);
  await mkdir(parent, { recursive: true });

  const stage = path.join(parent, `.${name}.rtifact-stage-${randomUUID()}`);

  try {
    await writeFile(stage, contents, { encoding: "utf8", flag: "wx" });
    await publishFileStage(stage, output, authorization, operations);
  } finally {
    await rm(stage, { force: true });
  }
}

async function publishFileStage(
  stage: string,
  output: string,
  authorization: OutputAuthorization,
  operations: PublicationOperations,
) {
  const parent = path.dirname(output);
  const name = path.basename(output);
  const backup = path.join(parent, `.${name}.rtifact-backup-${randomUUID()}`);
  await publishAuthorizedStage(
    stage,
    output,
    backup,
    authorization,
    operations,
    false,
  );
}

export async function publishPreparedFile(
  preparedFile: string,
  output: string,
  authorization: OutputAuthorization,
  operations: PublicationOperations = defaultPublicationOperations,
) {
  const parent = path.dirname(output);
  const name = path.basename(output);
  await assertOutputAuthorization(output, authorization);
  await mkdir(parent, { recursive: true });
  const stage = path.join(parent, `.${name}.rtifact-stage-${randomUUID()}`);
  let failure: Error | undefined;
  try {
    const contents = await readStableFile(
      preparedFile,
      BUILD_RESOURCE_LIMITS.artifactBytes,
    );
    await writeFile(stage, contents, { flag: "wx" });
    await publishFileStage(stage, output, authorization, operations);
  } catch (error) {
    failure = error instanceof Error ? error : new Error(formatError(error));
  }
  try {
    await operations.rm(stage, { force: true });
  } catch (cleanupError) {
    if (!failure) failure = new Error(formatError(cleanupError));
    else
      failure.message += `\nCleanup also failed: ${formatError(cleanupError)}`;
  }
  if (failure) throw failure;
}

async function validatePreparedDirectory(directory: string) {
  let files = 0;
  let bytes = 0;
  const visit = async (current: string): Promise<void> => {
    const directory = await opendir(current);
    for await (const entry of directory) {
      const candidate = path.join(current, entry.name);
      if (entry.isSymbolicLink()) {
        throw new RtifactError(
          `Prepared output contains a symbolic link: ${candidate}`,
          {
            code: "INVALID_PREPARED_OUTPUT",
          },
        );
      }
      if (entry.isDirectory()) {
        await visit(candidate);
        continue;
      }
      const fileStat = await lstat(candidate, { bigint: true });
      if (!entry.isFile() || !fileStat.isFile() || fileStat.isSymbolicLink()) {
        throw new RtifactError(
          `Prepared output contains an unsupported entry: ${candidate}`,
          {
            code: "INVALID_PREPARED_OUTPUT",
          },
        );
      }
      files += 1;
      bytes += Number(fileStat.size);
      if (
        fileStat.size > BigInt(BUILD_RESOURCE_LIMITS.outputFileBytes) ||
        files > BUILD_RESOURCE_LIMITS.files ||
        bytes > BUILD_RESOURCE_LIMITS.outputBytes
      ) {
        throw new RtifactError(
          "Prepared output exceeds the build resource limits.",
          {
            code: "INVALID_PREPARED_OUTPUT",
          },
        );
      }
    }
  };
  await visit(directory);
}

async function copyPreparedDirectory(source: string, destination: string) {
  let files = 0;
  let bytes = 0;
  const visit = async (
    currentSource: string,
    currentDestination: string,
  ): Promise<void> => {
    const directory = await opendir(currentSource);
    for await (const entry of directory) {
      const sourcePath = path.join(currentSource, entry.name);
      const destinationPath = path.join(currentDestination, entry.name);
      const sourceStat = await lstat(sourcePath, { bigint: true });
      if (entry.isSymbolicLink() || sourceStat.isSymbolicLink()) {
        throw new RtifactError(
          `Prepared output contains a symbolic link: ${sourcePath}`,
          { code: "INVALID_PREPARED_OUTPUT" },
        );
      }
      if (entry.isDirectory() && sourceStat.isDirectory()) {
        await mkdir(destinationPath);
        await visit(sourcePath, destinationPath);
        continue;
      }
      if (!entry.isFile() || !sourceStat.isFile()) {
        throw new RtifactError(
          `Prepared output contains an unsupported entry: ${sourcePath}`,
          { code: "INVALID_PREPARED_OUTPUT" },
        );
      }
      files += 1;
      bytes += Number(sourceStat.size);
      if (
        sourceStat.size > BigInt(BUILD_RESOURCE_LIMITS.outputFileBytes) ||
        files > BUILD_RESOURCE_LIMITS.files ||
        bytes > BUILD_RESOURCE_LIMITS.outputBytes
      ) {
        throw new RtifactError(
          "Prepared output exceeds the build resource limits.",
          { code: "INVALID_PREPARED_OUTPUT" },
        );
      }
      const contents = await readStableFile(
        sourcePath,
        BUILD_RESOURCE_LIMITS.outputFileBytes,
        { dev: sourceStat.dev, ino: sourceStat.ino, size: sourceStat.size },
      );
      await writeFile(destinationPath, contents, { flag: "wx" });
    }
  };
  await visit(source, destination);
}

export async function publishPreparedDirectory(
  preparedDirectory: string,
  output: string,
  authorization: OutputAuthorization,
  operations: PublicationOperations = defaultPublicationOperations,
) {
  let stage: string | undefined;
  let failure: Error | undefined;
  try {
    stage = await createOutputStage(output, authorization);
    await copyPreparedDirectory(preparedDirectory, stage);
    await validatePreparedDirectory(stage);
    await writeOutputMarker(stage);
    await commitOutput(stage, output, authorization, operations);
    stage = undefined;
  } catch (error) {
    failure = error instanceof Error ? error : new Error(formatError(error));
  }
  await cleanupDirectory(stage, failure, operations.rm);
  if (failure) throw failure;
}
