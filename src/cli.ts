import path from "node:path";
import process from "node:process";
import semver from "semver";
import { parseArgs, USAGE } from "./args.js";
import { buildApplication, withTemporaryApplicationBuild } from "./build.js";
import { confirmReplacement as promptForReplacement } from "./confirmation.js";
import { NODE_ENGINE, PACKAGE_VERSION } from "./constants.js";
import { formatError, hasErrorCode, YoloJsxError } from "./errors.js";
import {
  resolveAndValidateEntry,
  resolveAndValidateHtmlOutput,
  resolveAndValidateInputDirectory,
  resolveAndValidateOutput,
  isWithin,
} from "./paths.js";
import {
  commitFileOutput,
  inspectFileOutput,
  inspectOutput,
} from "./output.js";
import { renderPrismThemeCatalog } from "./prism-themes.js";
import { createSingleFileArtifact } from "./single-file.js";
import { resolveThemeSelection } from "./theme-modules.js";
import { renderThemeCatalog } from "./themes.js";

type Writable = Pick<NodeJS.WritableStream, "write">;
type ConfirmReplacement = (
  target: string,
  options: {
    input: NodeJS.ReadableStream & { isTTY?: boolean };
    output: Writable;
  },
) => Promise<boolean>;

interface CliOptions {
  cwd?: string;
  stdin?: NodeJS.ReadableStream & { isTTY?: boolean };
  stdout?: Writable;
  stderr?: Writable;
  nodeVersion?: string;
  confirmReplacement?: ConfirmReplacement;
}

function assertSupportedNode(nodeVersion: string) {
  if (!semver.satisfies(nodeVersion, NODE_ENGINE)) {
    throw new YoloJsxError(
      `Node.js ${nodeVersion} is not supported. yolojsx requires ${NODE_ENGINE}.`,
      { code: "UNSUPPORTED_NODE" },
    );
  }
}

export async function runCli(
  argv: string[],
  {
    cwd = process.cwd(),
    stdin = process.stdin,
    stdout = process.stdout,
    stderr = process.stderr,
    nodeVersion = process.versions.node,
    confirmReplacement = promptForReplacement,
  }: CliOptions = {},
) {
  try {
    assertSupportedNode(nodeVersion);
    const options = parseArgs(argv);

    if (options.action === "help") {
      stdout.write(`${USAGE}\n`);
      return 0;
    }
    if (options.action === "version") {
      stdout.write(`${PACKAGE_VERSION}\n`);
      return 0;
    }
    if (options.action === "themes") {
      stdout.write(renderThemeCatalog());
      return 0;
    }
    if (options.action === "prism-themes") {
      stdout.write(await renderPrismThemeCatalog());
      return 0;
    }

    if (options.action === "pack") {
      const inputDirectory = await resolveAndValidateInputDirectory(
        options.inputDir,
        cwd,
      );
      const output = await resolveAndValidateHtmlOutput(options.output, cwd, {
        inputDirectory,
      });
      const outputState = await inspectFileOutput(output, true);
      if (outputState.exists && !options.force) {
        const confirmed = await confirmReplacement(output, {
          input: stdin,
          output: stderr,
        });
        if (!confirmed) {
          stderr.write("Cancelled. Existing output was not changed.\n");
          return 1;
        }
      }
      if (outputState.exists && options.force) {
        stderr.write(`Warning: replacing existing HTML output: ${output}\n`);
      }
      const artifact = await createSingleFileArtifact(inputDirectory);
      await commitFileOutput(artifact.html, output);
      stdout.write(
        `Packed ${inputDirectory}\nOutput: ${output}\nSize: ${artifact.bytes} bytes\n`,
      );
      return 0;
    }

    const entry = await resolveAndValidateEntry(options.entry, cwd);
    // ponytail: scan the invocation tree; follow Vite's module graph if large workspaces become slow.
    const sourceDirectory = isWithin(cwd, entry) ? cwd : path.dirname(entry);
    const { theme, source: themeSource } = await resolveThemeSelection(
      options.theme,
      cwd,
    );
    const onWarning = (message: string) =>
      stderr.write(`Warning: ${message}\n`);

    if (options.deprecatedSingleFile) {
      stderr.write(
        "Warning: --single-file is deprecated because HTML file output is now the default.\n",
      );
    }

    if (options.outputMode === "file") {
      const output = await resolveAndValidateHtmlOutput(options.output, cwd, {
        entry,
      });
      const outputState = await inspectFileOutput(output, true);
      if (outputState.exists && !options.force) {
        const confirmed = await confirmReplacement(output, {
          input: stdin,
          output: stderr,
        });
        if (!confirmed) {
          stderr.write("Cancelled. Existing output was not changed.\n");
          return 1;
        }
      }
      if (outputState.exists && options.force) {
        stderr.write(`Warning: replacing existing HTML output: ${output}\n`);
      }
      let artifact;
      try {
        artifact = await withTemporaryApplicationBuild(
          {
            entry,
            sourceDirectory,
            base: "./",
            singleFile: true,
            cdn: !options.selfContained,
            theme,
            themeSource,
            onWarning,
          },
          createSingleFileArtifact,
        );
      } catch (error) {
        if (hasErrorCode(error, "PACK_FAILED")) {
          throw new YoloJsxError(
            `${formatError(error)}\nTry \`--out-dir dist\` for a directory build that supports this application graph.`,
            { code: "PACK_FAILED" },
          );
        }
        throw error;
      }
      await commitFileOutput(artifact.html, output);
      stdout.write(
        `Built ${entry}\nOutput: ${output}\nSize: ${artifact.bytes} bytes\n`,
      );
      return 0;
    }

    if (!options.outDir) {
      throw new YoloJsxError("Directory output requires --out-dir.", {
        code: "INVALID_ARGUMENTS",
      });
    }
    const output = await resolveAndValidateOutput(
      options.outDir,
      cwd,
      entry,
      themeSource ? [themeSource] : [],
    );
    const outputState = await inspectOutput(output, true);

    if (outputState.exists && !options.force) {
      const confirmed = await confirmReplacement(output, {
        input: stdin,
        output: stderr,
      });
      if (!confirmed) {
        stderr.write("Cancelled. Existing output was not changed.\n");
        return 1;
      }
    }

    if (outputState.unowned) {
      stderr.write(`Warning: replacing unowned output directory: ${output}\n`);
    }

    await buildApplication({
      entry,
      sourceDirectory,
      output,
      base: options.base,
      theme,
      themeSource,
      onWarning,
    });
    stdout.write(`Built ${entry}\nOutput: ${output}\n`);
    return 0;
  } catch (error) {
    stderr.write(`yolojsx: ${formatError(error)}\n`);
    return 1;
  }
}

export async function main(argv = process.argv.slice(2)) {
  const exitCode = await runCli(argv);
  process.exitCode = exitCode;
}
