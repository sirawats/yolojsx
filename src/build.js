import { cp, mkdtemp, realpath, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { build } from "vite";
import { createCoreAliases, resolvePackageImport } from "./dependencies.js";
import { YoloJsxError } from "./errors.js";
import {
  cleanupDirectory,
  commitOutput,
  createOutputStage,
  writeOutputMarker,
} from "./output.js";
import {
  createEntryPlugin,
  createHtml,
  createMainModule,
  createTailwindStyles,
} from "./templates.js";
import { resolveFoundationStylesheet } from "./theme-css.js";
import { renderThemeCss } from "./themes.js";

async function createWorkspace(entry, sourceDirectory, theme, customCss) {
  const temporaryWorkspace = await mkdtemp(
    path.join(os.tmpdir(), "yolojsx-work-"),
  );
  const workspace = await realpath(temporaryWorkspace);
  const themeCssPath = path.join(workspace, "theme.css");
  await Promise.all([
    writeFile(path.join(workspace, "index.html"), createHtml(), "utf8"),
    writeFile(path.join(workspace, "main.jsx"), createMainModule(), "utf8"),
    writeFile(themeCssPath, renderThemeCss(theme), "utf8"),
    writeFile(
      path.join(workspace, "styles.css"),
      createTailwindStyles(
        workspace,
        sourceDirectory,
        resolvePackageImport("tailwindcss/index.css"),
        resolveFoundationStylesheet(),
        themeCssPath,
        customCss,
      ),
      "utf8",
    ),
  ]);
  return workspace;
}

function asBuildError(error) {
  if (error instanceof YoloJsxError) {
    return error;
  }
  return new YoloJsxError(`Build failed: ${error.message ?? String(error)}`, {
    code: "BUILD_FAILED",
    cause: error,
  });
}

export async function withTemporaryApplicationBuild(
  {
    entry,
    sourceDirectory = path.dirname(entry),
    base,
    singleFile = false,
    theme,
    customCss,
  },
  consume,
) {
  let workspace;

  try {
    workspace = await createWorkspace(entry, sourceDirectory, theme, customCss);
    const workspaceOutput = path.join(workspace, "dist");

    await build({
      root: workspace,
      base,
      configFile: false,
      envFile: false,
      publicDir: false,
      appType: "spa",
      logLevel: "silent",
      plugins: [createEntryPlugin(entry, theme), react(), tailwindcss()],
      resolve: {
        alias: createCoreAliases(),
        dedupe: ["react", "react-dom"],
      },
      build: {
        outDir: workspaceOutput,
        emptyOutDir: true,
        copyPublicDir: false,
        ...(singleFile
          ? {
              assetsInlineLimit: () => true,
              cssCodeSplit: false,
              modulePreload: false,
              rolldownOptions: {
                output: {
                  codeSplitting: false,
                },
              },
            }
          : {}),
      },
    });

    return await consume(workspaceOutput);
  } catch (error) {
    const failure = asBuildError(error);
    await cleanupDirectory(workspace, failure);
    workspace = undefined;
    throw failure;
  } finally {
    await cleanupDirectory(workspace);
  }
}

export async function buildApplication({
  entry,
  sourceDirectory,
  output,
  base,
  theme,
  customCss,
}) {
  let stage;

  try {
    stage = await createOutputStage(output);
    await withTemporaryApplicationBuild(
      { entry, sourceDirectory, base, theme, customCss },
      async (workspaceOutput) => {
        await cp(workspaceOutput, stage, { recursive: true });
        await writeOutputMarker(stage);
      },
    );
    await commitOutput(stage, output);
    stage = undefined;
  } catch (error) {
    const failure = asBuildError(error);
    await cleanupDirectory(stage, failure);
    stage = undefined;
    throw failure;
  } finally {
    await cleanupDirectory(stage);
  }
}
