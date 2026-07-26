import { constants as fsConstants } from "node:fs";
import { access, lstat, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { YoloJsxError } from "./errors.js";

export function isWithin(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  );
}

export async function resolveAndValidateEntry(entryArgument, cwd) {
  const entry = path.resolve(cwd, entryArgument);

  if (path.extname(entry).toLowerCase() !== ".jsx") {
    throw new YoloJsxError(`Entry must be a .jsx file: ${entry}`, {
      code: "INVALID_ENTRY",
    });
  }

  try {
    const entryStat = await stat(entry);
    if (!entryStat.isFile()) {
      throw new YoloJsxError(`Entry is not a file: ${entry}`, {
        code: "INVALID_ENTRY",
      });
    }
    await access(entry, fsConstants.R_OK);
  } catch (error) {
    if (error instanceof YoloJsxError) {
      throw error;
    }
    throw new YoloJsxError(`Entry is not a readable file: ${entry}`, {
      code: "INVALID_ENTRY",
      cause: error,
    });
  }

  return realpath(entry);
}

export async function resolveAndValidateCss(cssArgument, cwd) {
  if (!cssArgument) {
    return undefined;
  }
  const stylesheet = path.resolve(cwd, cssArgument);
  if (path.extname(stylesheet).toLowerCase() !== ".css") {
    throw new YoloJsxError(
      `Custom stylesheet must be a .css file: ${stylesheet}`,
      {
        code: "INVALID_CSS",
      },
    );
  }
  try {
    const stylesheetStat = await stat(stylesheet);
    if (!stylesheetStat.isFile()) {
      throw new YoloJsxError(`Custom stylesheet is not a file: ${stylesheet}`, {
        code: "INVALID_CSS",
      });
    }
    await access(stylesheet, fsConstants.R_OK);
  } catch (error) {
    if (error instanceof YoloJsxError) {
      throw error;
    }
    throw new YoloJsxError(
      `Custom stylesheet is not a readable file: ${stylesheet}`,
      {
        code: "INVALID_CSS",
        cause: error,
      },
    );
  }
  return realpath(stylesheet);
}

export async function resolveAndValidateOutput(outArgument, cwd, entry) {
  const output = path.resolve(cwd, outArgument);
  const root = path.parse(output).root;

  if (output === root) {
    throw new YoloJsxError(
      `Refusing to use a filesystem root as output: ${output}`,
      {
        code: "DANGEROUS_OUTPUT",
      },
    );
  }
  if (output === path.resolve(cwd)) {
    throw new YoloJsxError(
      `Refusing to use the current working directory as output: ${output}`,
      { code: "DANGEROUS_OUTPUT" },
    );
  }
  if (isWithin(output, entry)) {
    throw new YoloJsxError(
      `Refusing to use an output directory that contains the source entry: ${output}`,
      { code: "DANGEROUS_OUTPUT" },
    );
  }

  try {
    const outputStat = await lstat(output);
    if (outputStat.isSymbolicLink()) {
      throw new YoloJsxError(
        `Refusing to replace a symbolic-link output: ${output}`,
        {
          code: "DANGEROUS_OUTPUT",
        },
      );
    }
    if (!outputStat.isDirectory()) {
      throw new YoloJsxError(
        `Output exists and is not a directory: ${output}`,
        {
          code: "INVALID_OUTPUT",
        },
      );
    }
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }

  return output;
}

async function canonicalizePotentialPath(value) {
  const missing = [];
  let current = value;

  while (true) {
    try {
      const resolved = await realpath(current);
      return path.join(resolved, ...missing.reverse());
    } catch (error) {
      if (error?.code !== "ENOENT") {
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

export async function resolveAndValidateInputDirectory(inputArgument, cwd) {
  const input = path.resolve(cwd, inputArgument);

  try {
    const inputStat = await stat(input);
    if (!inputStat.isDirectory()) {
      throw new YoloJsxError(`Pack input is not a directory: ${input}`, {
        code: "INVALID_PACK_INPUT",
      });
    }
    await access(input, fsConstants.R_OK);
  } catch (error) {
    if (error instanceof YoloJsxError) {
      throw error;
    }
    throw new YoloJsxError(`Pack input is not a readable directory: ${input}`, {
      code: "INVALID_PACK_INPUT",
      cause: error,
    });
  }

  return realpath(input);
}

export async function resolveAndValidateHtmlOutput(
  outputArgument,
  cwd,
  { entry, inputDirectory } = {},
) {
  const defaultName = entry
    ? `${path.basename(entry, path.extname(entry))}.html`
    : undefined;
  const output = path.resolve(cwd, outputArgument ?? defaultName ?? "");

  if (path.extname(output).toLowerCase() !== ".html") {
    throw new YoloJsxError(`Single-file output must end in .html: ${output}`, {
      code: "INVALID_FILE_OUTPUT",
    });
  }

  const canonicalOutput = await canonicalizePotentialPath(output);
  if (inputDirectory && isWithin(inputDirectory, canonicalOutput)) {
    throw new YoloJsxError(
      `Refusing to write the packaged HTML inside its input directory: ${output}`,
      { code: "DANGEROUS_FILE_OUTPUT" },
    );
  }

  try {
    const outputStat = await lstat(output);
    if (outputStat.isSymbolicLink()) {
      throw new YoloJsxError(
        `Refusing to replace a symbolic-link output: ${output}`,
        {
          code: "DANGEROUS_FILE_OUTPUT",
        },
      );
    }
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
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }

  return output;
}
