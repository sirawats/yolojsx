import process from "node:process";
import semver from "semver";
import { parseArgs, USAGE } from "./args.js";
import {
  cleanupPreparedOutput,
  runBuildJob,
  type BuildWorkerTestOverrides,
} from "./build-worker.js";
import { confirmReplacement as promptForReplacement } from "./confirmation.js";
import { NODE_ENGINE, PACKAGE_VERSION } from "./constants.js";
import { formatError, hasErrorCode, RtifactError } from "./errors.js";
import {
  resolveAndValidateEntry,
  resolveAndValidateHtmlOutput,
  resolveAndValidateInputDirectory,
  resolveAndValidateOutput,
} from "./paths.js";
import {
  inspectFileOutput,
  inspectOutput,
  publishPreparedDirectory,
  publishPreparedFile,
} from "./output.js";
import { renderPrismThemeCatalog } from "./prism-themes.js";
import { getThemeSource, resolveThemeInput } from "./theme-modules.js";
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
  workerOverrides?: BuildWorkerTestOverrides;
}

function assertSupportedNode(nodeVersion: string) {
  if (!semver.satisfies(nodeVersion, NODE_ENGINE)) {
    throw new RtifactError(
      `Node.js ${nodeVersion} is not supported. Rtifact requires ${NODE_ENGINE}.`,
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
    workerOverrides,
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
    if (options.action === "theme-inspect") {
      const sourceCode = await getThemeSource(options.themeName, cwd);
      stdout.write(sourceCode.endsWith("\n") ? sourceCode : `${sourceCode}\n`);
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
      let prepared;
      try {
        prepared = await runBuildJob(
          { kind: "pack", inputDirectory },
          workerOverrides,
        );
        await publishPreparedFile(
          prepared.path,
          output,
          outputState.authorization,
        );
        stdout.write(
          `Packed ${inputDirectory}\nOutput: ${output}\nSize: ${prepared.bytes} bytes\n`,
        );
      } catch (error) {
        const failure =
          error instanceof Error ? error : new Error(formatError(error));
        await cleanupPreparedOutput(prepared, failure);
        prepared = undefined;
        throw failure;
      } finally {
        await cleanupPreparedOutput(prepared);
      }
      return 0;
    }

    const entry = await resolveAndValidateEntry(options.entry, cwd);
    const themeInput = await resolveThemeInput(options.theme, cwd);
    const themeSource =
      themeInput.kind === "module" ? themeInput.source : undefined;

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
      let prepared;
      try {
        prepared = await runBuildJob(
          {
            kind: "file",
            cwd,
            entry,
            base: "./",
            cdn: !options.selfContained,
            theme: themeInput,
          },
          workerOverrides,
        );
        for (const warning of prepared.warnings) {
          stderr.write(`Warning: ${warning}\n`);
        }
        await publishPreparedFile(
          prepared.path,
          output,
          outputState.authorization,
        );
      } catch (error) {
        const failure =
          error instanceof Error ? error : new Error(formatError(error));
        await cleanupPreparedOutput(prepared, failure);
        prepared = undefined;
        if (hasErrorCode(error, "PACK_FAILED")) {
          throw new RtifactError(
            `${formatError(error)}\nTry \`--out-dir dist\` for a directory build that supports this application graph.`,
            { code: "PACK_FAILED" },
          );
        }
        throw failure;
      } finally {
        await cleanupPreparedOutput(prepared);
      }
      stdout.write(
        `Built ${entry}\nOutput: ${output}\nSize: ${prepared?.bytes ?? 0} bytes\n`,
      );
      return 0;
    }

    if (!options.outDir) {
      throw new RtifactError("Directory output requires --out-dir.", {
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

    let prepared;
    try {
      prepared = await runBuildJob(
        {
          kind: "directory",
          cwd,
          entry,
          base: options.base,
          theme: themeInput,
        },
        workerOverrides,
      );
      for (const warning of prepared.warnings) {
        stderr.write(`Warning: ${warning}\n`);
      }
      await publishPreparedDirectory(
        prepared.path,
        output,
        outputState.authorization,
      );
    } catch (error) {
      const failure =
        error instanceof Error ? error : new Error(formatError(error));
      await cleanupPreparedOutput(prepared, failure);
      prepared = undefined;
      throw failure;
    } finally {
      await cleanupPreparedOutput(prepared);
    }
    stdout.write(`Built ${entry}\nOutput: ${output}\n`);
    return 0;
  } catch (error) {
    stderr.write(`rtifact: ${formatError(error)}\n`);
    return 1;
  }
}

export async function main(argv = process.argv.slice(2)) {
  const exitCode = await runCli(argv);
  process.exitCode = exitCode;
}
