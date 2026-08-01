import { DEFAULT_BASE, PACKAGE_VERSION } from "./constants.js";
import { RtifactError } from "./errors.js";
import { DEFAULT_THEME_ID } from "./themes.js";

export const USAGE = `Usage: rtifact <entry.jsx|entry.tsx> [options]
       rtifact themes | rtifact --themes
       rtifact prism-themes | rtifact --prism-themes
       rtifact pack <directory> --output <file.html> [options]

Build a JSX component into one CDN-backed compressed HTML file by default.

Options:
      --output <path>    HTML output path (default: ./<EntryName>.html)
  -o, --out-dir <path>  Build a directory instead of one HTML file
      --base <path>     Directory-mode public base path (default: ./)
      --self-contained  Embed runtime dependencies for offline use
      --theme <value>   Global theme preset or .ts/.jsx module (default: default)
      --themes           List available theme names
      --prism-themes     List available Prism theme names
      --single-file     Deprecated alias for the default file mode
      --force           Replace an existing protected output
  -h, --help            Show this help
  -v, --version         Show the installed version

Run \`rtifact themes\` or \`rtifact prism-themes\` to list available themes.`;

interface BuildArguments {
  action: "build";
  entry: string;
  outputMode: "file" | "directory";
  outDir?: string;
  base: string;
  output?: string;
  theme: string;
  force: boolean;
  deprecatedSingleFile: boolean;
  selfContained: boolean;
}

interface PackArguments {
  action: "pack";
  inputDir: string;
  output: string;
  force: boolean;
}

export type ParsedArguments =
  | BuildArguments
  | PackArguments
  | { action: "help" }
  | { action: "version"; version: string }
  | { action: "themes" }
  | { action: "prism-themes" };

function invalid(message: string) {
  return new RtifactError(message, { code: "INVALID_ARGUMENTS" });
}

function readOptionValue(argv: string[], index: number, option: string) {
  const value = argv[index + 1];
  if (!value || value.startsWith("-")) {
    throw invalid(`${option} requires a value.`);
  }
  return value;
}

function setOnce(seen: Set<string>, name: string) {
  if (seen.has(name)) {
    throw invalid(`${name} may only be specified once.`);
  }
  seen.add(name);
}

export function parseArgs(argv: string[]): ParsedArguments {
  const requestedAction = argv[0];
  const action =
    requestedAction === "pack"
      ? "pack"
      : requestedAction === "themes" || requestedAction === "--themes"
        ? "themes"
        : requestedAction === "prism-themes" ||
            requestedAction === "--prism-themes"
          ? "prism-themes"
          : "build";
  const options: {
    action: "build" | "pack" | "themes" | "prism-themes";
    entry?: string;
    inputDir?: string;
    outDir?: string;
    base: string;
    output?: string;
    theme: string;
    force: boolean;
    singleFile: boolean;
    selfContained: boolean;
  } = {
    action,
    entry: undefined,
    inputDir: undefined,
    outDir: undefined,
    base: DEFAULT_BASE,
    output: undefined,
    theme: DEFAULT_THEME_ID,
    force: false,
    singleFile: false,
    selfContained: false,
  };
  const positionals: string[] = [];
  const seen = new Set<string>();
  let parseOptions = true;
  const startIndex = action === "build" ? 0 : 1;

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
      setOnce(seen, "--force");
      options.force = true;
      continue;
    }
    if (parseOptions && arg === "--single-file") {
      setOnce(seen, "--single-file");
      options.singleFile = true;
      continue;
    }
    if (parseOptions && arg === "--self-contained") {
      setOnce(seen, "--self-contained");
      options.selfContained = true;
      continue;
    }

    const valueOptions = [
      ["--output", "output"],
      ["--out-dir", "outDir"],
      ["--base", "base"],
      ["--theme", "theme"],
    ] as const;
    let matched = false;
    for (const [name, property] of valueOptions) {
      const shortMatch = name === "--out-dir" && arg === "-o";
      if (arg === name || shortMatch) {
        setOnce(seen, name);
        options[property] = readOptionValue(argv, index, arg);
        index += 1;
        matched = true;
        break;
      }
      if (arg.startsWith(`${name}=`)) {
        setOnce(seen, name);
        options[property] = arg.slice(name.length + 1);
        if (!options[property]) {
          throw invalid(`${name} requires a value.`);
        }
        matched = true;
        break;
      }
    }
    if (matched) {
      continue;
    }
    if (parseOptions && arg.startsWith("-")) {
      throw invalid(`Unknown option: ${arg}`);
    }
    positionals.push(arg);
  }

  if (action === "themes" || action === "prism-themes") {
    if (positionals.length > 0 || seen.size > 0) {
      throw invalid(
        `The ${action} command does not accept arguments or build options.`,
      );
    }
    return { action };
  }

  if (positionals.length !== 1) {
    const reason =
      positionals.length === 0
        ? action === "pack"
          ? "A build directory is required."
          : "A JSX or TSX entry file is required."
        : action === "pack"
          ? "Exactly one build directory is supported."
          : "Exactly one JSX or TSX entry file is supported.";
    throw invalid(`${reason}\n\n${USAGE}`);
  }

  if (action === "pack") {
    const rejected = [
      "--single-file",
      "--self-contained",
      "--out-dir",
      "--base",
      "--theme",
    ].filter((name) => seen.has(name));
    if (rejected.length > 0) {
      throw invalid(`The pack command does not accept ${rejected.join(", ")}.`);
    }
    if (!options.output) {
      throw invalid(
        `The pack command requires --output <file.html>.\n\n${USAGE}`,
      );
    }
    return {
      action: "pack",
      inputDir: positionals[0],
      output: options.output,
      force: options.force,
    };
  }

  if (options.outDir && options.output) {
    throw invalid("--output cannot be combined with --out-dir.");
  }
  if (seen.has("--base") && !options.outDir) {
    throw invalid("--base requires directory mode selected with --out-dir.");
  }
  if (options.singleFile && (options.outDir || seen.has("--base"))) {
    throw invalid("--single-file cannot be combined with --out-dir or --base.");
  }
  if (options.selfContained && (options.outDir || seen.has("--base"))) {
    throw invalid(
      "--self-contained cannot be combined with --out-dir or --base.",
    );
  }
  return {
    action: "build",
    entry: positionals[0],
    outputMode: options.outDir ? "directory" : "file",
    outDir: options.outDir,
    base: options.base,
    output: options.output,
    theme: options.theme,
    force: options.force,
    deprecatedSingleFile: options.singleFile,
    selfContained: options.selfContained,
  };
}
