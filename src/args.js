import {
  DEFAULT_BASE,
  DEFAULT_OUT_DIR,
  PACKAGE_VERSION,
} from "./constants.js";
import { YoloJsxError } from "./errors.js";

export const USAGE = `Usage: yolojsx <entry.jsx> [options]
       yolojsx pack <directory> --output <file.html> [options]

Build a JSX component into a deployable React application.

Options:
  -o, --out-dir <path>  Output directory (default: ./dist)
      --base <path>     Public base path (default: ./)
      --single-file    Create one compressed HTML file
      --output <path>  Single HTML output path
      --force           Replace an existing protected output
  -h, --help            Show this help
  -v, --version         Show the installed version`;

function readOptionValue(argv, index, option) {
  const value = argv[index + 1];
  if (!value || value.startsWith("-")) {
    throw new YoloJsxError(`${option} requires a value.`, {
      code: "INVALID_ARGUMENTS",
    });
  }
  return value;
}

export function parseArgs(argv) {
  const action = argv[0] === "pack" ? "pack" : "build";
  const options = {
    entry: undefined,
    inputDir: undefined,
    outDir: DEFAULT_OUT_DIR,
    base: DEFAULT_BASE,
    singleFile: false,
    output: undefined,
    force: false,
    action,
  };
  const positionals = [];
  let parseOptions = true;
  let outDirProvided = false;
  let baseProvided = false;
  const startIndex = action === "pack" ? 1 : 0;

  for (let index = startIndex; index < argv.length; index += 1) {
    const arg = argv[index];

    if (parseOptions && arg === "--") {
      parseOptions = false;
      continue;
    }
    if (parseOptions && (arg === "--help" || arg === "-h")) {
      return { ...options, action: "help" };
    }
    if (parseOptions && (arg === "--version" || arg === "-v")) {
      return { ...options, action: "version", version: PACKAGE_VERSION };
    }
    if (parseOptions && arg === "--force") {
      options.force = true;
      continue;
    }
    if (parseOptions && arg === "--single-file") {
      options.singleFile = true;
      continue;
    }
    if (parseOptions && arg === "--output") {
      options.output = readOptionValue(argv, index, arg);
      index += 1;
      continue;
    }
    if (parseOptions && arg.startsWith("--output=")) {
      options.output = arg.slice("--output=".length);
      if (!options.output) {
        throw new YoloJsxError("--output requires a value.", {
          code: "INVALID_ARGUMENTS",
        });
      }
      continue;
    }
    if (parseOptions && (arg === "--out-dir" || arg === "-o")) {
      options.outDir = readOptionValue(argv, index, arg);
      outDirProvided = true;
      index += 1;
      continue;
    }
    if (parseOptions && arg.startsWith("--out-dir=")) {
      options.outDir = arg.slice("--out-dir=".length);
      if (!options.outDir) {
        throw new YoloJsxError("--out-dir requires a value.", {
          code: "INVALID_ARGUMENTS",
        });
      }
      outDirProvided = true;
      continue;
    }
    if (parseOptions && arg === "--base") {
      options.base = readOptionValue(argv, index, arg);
      baseProvided = true;
      index += 1;
      continue;
    }
    if (parseOptions && arg.startsWith("--base=")) {
      options.base = arg.slice("--base=".length);
      if (!options.base) {
        throw new YoloJsxError("--base requires a value.", {
          code: "INVALID_ARGUMENTS",
        });
      }
      baseProvided = true;
      continue;
    }
    if (parseOptions && arg.startsWith("-")) {
      throw new YoloJsxError(`Unknown option: ${arg}`, {
        code: "INVALID_ARGUMENTS",
      });
    }

    positionals.push(arg);
  }

  if (positionals.length !== 1) {
    const reason =
      positionals.length === 0
        ? action === "pack"
          ? "A build directory is required."
          : "A JSX entry file is required."
        : action === "pack"
          ? "Exactly one build directory is supported."
          : "Exactly one JSX entry file is supported.";
    throw new YoloJsxError(`${reason}\n\n${USAGE}`, {
      code: "INVALID_ARGUMENTS",
    });
  }

  if (action === "pack") {
    if (options.singleFile || outDirProvided || baseProvided) {
      throw new YoloJsxError(
        "The pack command does not accept --single-file, --out-dir, or --base.",
        { code: "INVALID_ARGUMENTS" },
      );
    }
    if (!options.output) {
      throw new YoloJsxError(
        `The pack command requires --output <file.html>.\n\n${USAGE}`,
        { code: "INVALID_ARGUMENTS" },
      );
    }
    return {
      action: "pack",
      inputDir: positionals[0],
      output: options.output,
      force: options.force,
    };
  }

  if (options.output && !options.singleFile) {
    throw new YoloJsxError("--output requires --single-file for JSX builds.", {
      code: "INVALID_ARGUMENTS",
    });
  }
  if (options.singleFile && (outDirProvided || baseProvided)) {
    throw new YoloJsxError(
      "--single-file cannot be combined with --out-dir or --base.",
      { code: "INVALID_ARGUMENTS" },
    );
  }

  options.entry = positionals[0];
  return {
    action: "build",
    entry: options.entry,
    outDir: options.outDir,
    base: options.base,
    singleFile: options.singleFile,
    output: options.output,
    force: options.force,
  };
}
