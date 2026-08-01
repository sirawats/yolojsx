import { constants as fsConstants } from "node:fs";
import { access, lstat, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { hasErrorCode, RtifactError } from "./errors.js";

export function isWithin(parent: string, candidate: string) {
  const relative = path.relative(parent, candidate);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  );
}

export async function resolveAndValidateEntry(
  entryArgument: string,
  cwd: string,
) {
  const entry = path.resolve(cwd, entryArgument);

  if (![".jsx", ".tsx"].includes(path.extname(entry).toLowerCase())) {
    throw new RtifactError(`Entry must be a .jsx or .tsx file: ${entry}`, {
      code: "INVALID_ENTRY",
    });
  }

  try {
    const entryStat = await stat(entry);
    if (!entryStat.isFile()) {
      throw new RtifactError(`Entry is not a file: ${entry}`, {
        code: "INVALID_ENTRY",
      });
    }
    await access(entry, fsConstants.R_OK);
  } catch (error) {
    if (error instanceof RtifactError) {
      throw error;
    }
    throw new RtifactError(`Entry is not a readable file: ${entry}`, {
      code: "INVALID_ENTRY",
      cause: error,
    });
  }

  return realpath(entry);
}

export async function resolveAndValidateThemeModule(
  themeArgument: string,
  cwd: string,
) {
  const themeModule = path.resolve(cwd, themeArgument);
  if (![".ts", ".jsx"].includes(path.extname(themeModule).toLowerCase())) {
    throw new RtifactError(
      `Theme module must be a .ts or .jsx file: ${themeModule}`,
      {
        code: "INVALID_THEME",
      },
    );
  }
  try {
    const themeStat = await stat(themeModule);
    if (!themeStat.isFile()) {
      throw new RtifactError(`Theme module is not a file: ${themeModule}`, {
        code: "INVALID_THEME",
      });
    }
    await access(themeModule, fsConstants.R_OK);
  } catch (error) {
    if (error instanceof RtifactError) {
      throw error;
    }
    throw new RtifactError(
      `Theme module is not a readable file: ${themeModule}`,
      {
        code: "INVALID_THEME",
        cause: error,
      },
    );
  }
  return realpath(themeModule);
}

export async function resolveAndValidateOutput(
  outArgument: string,
  cwd: string,
  entry: string,
  additionalInputs: string[] = [],
) {
  const output = path.resolve(cwd, outArgument);
  const root = path.parse(output).root;

  if (output === root) {
    throw new RtifactError(
      `Refusing to use a filesystem root as output: ${output}`,
      {
        code: "DANGEROUS_OUTPUT",
      },
    );
  }
  if (output === path.resolve(cwd)) {
    throw new RtifactError(
      `Refusing to use the current working directory as output: ${output}`,
      { code: "DANGEROUS_OUTPUT" },
    );
  }
  if (isWithin(output, entry)) {
    throw new RtifactError(
      `Refusing to use an output directory that contains the source entry: ${output}`,
      { code: "DANGEROUS_OUTPUT" },
    );
  }
  const containedInput = additionalInputs.find((input) =>
    isWithin(output, input),
  );
  if (containedInput) {
    throw new RtifactError(
      `Refusing to use an output directory that contains the theme module: ${output}`,
      { code: "DANGEROUS_OUTPUT" },
    );
  }

  try {
    const outputStat = await lstat(output);
    if (outputStat.isSymbolicLink()) {
      throw new RtifactError(
        `Refusing to replace a symbolic-link output: ${output}`,
        {
          code: "DANGEROUS_OUTPUT",
        },
      );
    }
    if (!outputStat.isDirectory()) {
      throw new RtifactError(
        `Output exists and is not a directory: ${output}`,
        {
          code: "INVALID_OUTPUT",
        },
      );
    }
  } catch (error) {
    if (!hasErrorCode(error, "ENOENT")) {
      throw error;
    }
  }

  return output;
}

async function canonicalizePotentialPath(value: string) {
  const missing: string[] = [];
  let current = value;

  while (true) {
    try {
      const resolved = await realpath(current);
      return path.join(resolved, ...missing.reverse());
    } catch (error) {
      if (!hasErrorCode(error, "ENOENT")) {
        throw error;
      }
      const parent = path.dirname(current);
      if (parent === current) {
        return value;
      }
      missing.push(path.basename(current));
      current = parent;
    }
  }
}

export async function resolveAndValidateInputDirectory(
  inputArgument: string,
  cwd: string,
) {
  const input = path.resolve(cwd, inputArgument);

  try {
    const inputStat = await stat(input);
    if (!inputStat.isDirectory()) {
      throw new RtifactError(`Pack input is not a directory: ${input}`, {
        code: "INVALID_PACK_INPUT",
      });
    }
    await access(input, fsConstants.R_OK);
  } catch (error) {
    if (error instanceof RtifactError) {
      throw error;
    }
    throw new RtifactError(`Pack input is not a readable directory: ${input}`, {
      code: "INVALID_PACK_INPUT",
      cause: error,
    });
  }

  return realpath(input);
}

export async function resolveAndValidateHtmlOutput(
  outputArgument: string | undefined,
  cwd: string,
  { entry, inputDirectory }: { entry?: string; inputDirectory?: string } = {},
) {
  const defaultName = entry
    ? `${path.basename(entry, path.extname(entry))}.html`
    : undefined;
  const output = path.resolve(cwd, outputArgument ?? defaultName ?? "");

  if (path.extname(output).toLowerCase() !== ".html") {
    throw new RtifactError(`Single-file output must end in .html: ${output}`, {
      code: "INVALID_FILE_OUTPUT",
    });
  }

  const canonicalOutput = await canonicalizePotentialPath(output);
  if (inputDirectory && isWithin(inputDirectory, canonicalOutput)) {
    throw new RtifactError(
      `Refusing to write the packaged HTML inside its input directory: ${output}`,
      { code: "DANGEROUS_FILE_OUTPUT" },
    );
  }

  try {
    const outputStat = await lstat(output);
    if (outputStat.isSymbolicLink()) {
      throw new RtifactError(
        `Refusing to replace a symbolic-link output: ${output}`,
        {
          code: "DANGEROUS_FILE_OUTPUT",
        },
      );
    }
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
  } catch (error) {
    if (!hasErrorCode(error, "ENOENT")) {
      throw error;
    }
  }

  return output;
}
