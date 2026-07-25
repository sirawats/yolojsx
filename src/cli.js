import path from "node:path";
import process from "node:process";
import semver from "semver";
import { parseArgs, USAGE } from "./args.js";
import { buildApplication, withTemporaryApplicationBuild } from "./build.js";
import { confirmReplacement as promptForReplacement } from "./confirmation.js";
import { NODE_ENGINE, PACKAGE_VERSION } from "./constants.js";
import { formatError, YoloJsxError } from "./errors.js";
import {
  resolveAndValidateCss,
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
import { createSingleFileArtifact } from "./single-file.js";
import { renderThemeCatalog, resolveTheme } from "./themes.js";

function assertSupportedNode(nodeVersion) {
  if (!semver.satisfies(nodeVersion, NODE_ENGINE)) {
    throw new YoloJsxError(
      `Node.js ${nodeVersion} is not supported. yolojsx requires ${NODE_ENGINE}.`,
      { code: "UNSUPPORTED_NODE" },
    );
  }
}

export async function runCli(
  argv,
  {
    cwd = process.cwd(),
    stdin = process.stdin,
    stdout = process.stdout,
    stderr = process.stderr,
    nodeVersion = process.versions.node,
    confirmReplacement = promptForReplacement,
  } = {},
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
    const customCss = await resolveAndValidateCss(options.css, cwd);
    const theme = resolveTheme(options.theme);

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
          { entry, sourceDirectory, base: "./", singleFile: true, theme, customCss },
          createSingleFileArtifact,
        );
      } catch (error) {
        if (error?.code === "PACK_FAILED") {
          throw new YoloJsxError(
            `${formatError(error)}\nTry \`--out-dir dist\` for a directory build that supports this application graph.`,
            { code: error.code },
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

    const output = await resolveAndValidateOutput(options.outDir, cwd, entry);
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
      customCss,
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
