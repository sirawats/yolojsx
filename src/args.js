import { DEFAULT_BASE, PACKAGE_VERSION } from "./constants.js";
import { YoloJsxError } from "./errors.js";
import { DEFAULT_THEME_ID, resolveTheme } from "./themes.js";

export const USAGE = `Usage: yolojsx <entry.jsx> [options]
       yolojsx themes
       yolojsx pack <directory> --output <file.html> [options]

Build a JSX component into one compressed HTML file by default.

Options:
      --output <path>   HTML output path (default: ./<EntryName>.html)
  -o, --out-dir <path> Build a directory instead of one HTML file
      --base <path>    Directory-mode public base path (default: ./)
      --theme <preset> Global theme preset (default: default)
      --css <path>     Custom CSS loaded after the preset
      --single-file    Deprecated alias for the default file mode
      --force          Replace an existing protected output
  -h, --help           Show this help
  -v, --version        Show the installed version

Run \`yolojsx themes\` to list available presets.`;

function invalid(message) {
  return new YoloJsxError(message, { code: "INVALID_ARGUMENTS" });
}

function readOptionValue(argv, index, option) {
  const value = argv[index + 1];
  if (!value || value.startsWith("-")) {
    throw invalid(`${option} requires a value.`);
  }
  return value;
}

function setOnce(seen, name) {
  if (seen.has(name)) {
    throw invalid(`${name} may only be specified once.`);
  }
  seen.add(name);
}

export function parseArgs(argv) {
  const requestedAction = argv[0];
  const action = requestedAction === "pack"
    ? "pack"
    : requestedAction === "themes"
      ? "themes"
      : "build";
  const options = {
    action,
    entry: undefined,
    inputDir: undefined,
    outDir: undefined,
    base: DEFAULT_BASE,
    output: undefined,
    theme: DEFAULT_THEME_ID,
    css: undefined,
    force: false,
    singleFile: false,
  };
  const positionals = [];
  const seen = new Set();
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

    const valueOptions = [
      ["--output", "output"],
      ["--out-dir", "outDir"],
      ["--base", "base"],
      ["--theme", "theme"],
      ["--css", "css"],
    ];
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

  if (action === "themes") {
    if (positionals.length > 0 || seen.size > 0) {
      throw invalid("The themes command does not accept arguments or build options.");
    }
    return { action: "themes" };
  }

  if (positionals.length !== 1) {
    const reason = positionals.length === 0
      ? action === "pack" ? "A build directory is required." : "A JSX entry file is required."
      : action === "pack" ? "Exactly one build directory is supported." : "Exactly one JSX entry file is supported.";
    throw invalid(`${reason}\n\n${USAGE}`);
  }

  if (action === "pack") {
    const rejected = ["--single-file", "--out-dir", "--base", "--theme", "--css"]
      .filter((name) => seen.has(name));
    if (rejected.length > 0) {
      throw invalid(`The pack command does not accept ${rejected.join(", ")}.`);
    }
    if (!options.output) {
      throw invalid(`The pack command requires --output <file.html>.\n\n${USAGE}`);
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
  resolveTheme(options.theme);

  return {
    action: "build",
    entry: positionals[0],
    outputMode: options.outDir ? "directory" : "file",
    outDir: options.outDir,
    base: options.base,
    output: options.output,
    theme: options.theme,
    css: options.css,
    force: options.force,
    deprecatedSingleFile: options.singleFile,
  };
}
