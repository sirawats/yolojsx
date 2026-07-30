import { cp, mkdtemp, realpath, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { build } from "vite";
import {
  createCdnImportMap,
  createCoreAliases,
  isCdnExternalImport,
  resolvePackageImport,
} from "./dependencies.js";
import { formatError, YoloJsxError } from "./errors.js";
import {
  cleanupDirectory,
  commitOutput,
  createOutputStage,
  writeOutputMarker,
} from "./output.js";
import { loadPrismThemeCatalog } from "./prism-themes.js";
import {
  createEntryPlugin,
  createHtml,
  createMainModule,
  createTailwindStyles,
} from "./templates.js";
import { resolveFoundationStylesheet } from "./theme-css.js";
import { renderThemeCss, type Theme } from "./themes.js";

interface TemporaryBuildOptions {
  entry: string;
  sourceDirectory?: string;
  base: string;
  singleFile?: boolean;
  cdn?: boolean;
  theme: Theme;
  customCss?: string;
  onWarning: (message: string) => unknown;
}

interface BuildApplicationOptions extends Omit<
  TemporaryBuildOptions,
  "singleFile" | "cdn"
> {
  sourceDirectory: string;
  output: string;
}

async function createWorkspace(
  entry: string,
  sourceDirectory: string,
  theme: Theme,
  customCss: string | undefined,
  cdn: boolean,
) {
  const temporaryWorkspace = await mkdtemp(
    path.join(os.tmpdir(), "yolojsx-work-"),
  );
  const workspace = await realpath(temporaryWorkspace);
  const themeCssPath = path.join(workspace, "theme.css");
  await Promise.all([
    writeFile(
      path.join(workspace, "index.html"),
      createHtml(cdn ? createCdnImportMap() : undefined),
      "utf8",
    ),
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

function asBuildError(error: unknown) {
  if (error instanceof YoloJsxError) {
    return error;
  }
  return new YoloJsxError(`Build failed: ${formatError(error)}`, {
    code: "BUILD_FAILED",
    cause: error,
  });
}

export async function withTemporaryApplicationBuild<T>(
  {
    entry,
    sourceDirectory = path.dirname(entry),
    base,
    singleFile = false,
    cdn = false,
    theme,
    customCss,
    onWarning,
  }: TemporaryBuildOptions,
  consume: (workspaceOutput: string) => T | Promise<T>,
): Promise<T> {
  let workspace: string | undefined;

  try {
    workspace = await createWorkspace(
      entry,
      sourceDirectory,
      theme,
      customCss,
      cdn,
    );
    const workspaceOutput = path.join(workspace, "dist");
    const prismThemes = await loadPrismThemeCatalog();

    await build({
      root: workspace,
      base,
      configFile: false,
      envFile: false,
      publicDir: false,
      appType: "spa",
      logLevel: "silent",
      plugins: [
        createEntryPlugin(entry, theme, prismThemes, onWarning),
        react(),
        tailwindcss(),
      ],
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
                ...(cdn ? { external: isCdnExternalImport } : {}),
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
  onWarning,
}: BuildApplicationOptions) {
  let stage: string | undefined;

  try {
    stage = await createOutputStage(output);
    const outputStage = stage;
    await withTemporaryApplicationBuild(
      { entry, sourceDirectory, base, theme, customCss, onWarning },
      async (workspaceOutput) => {
        await cp(workspaceOutput, outputStage, { recursive: true });
        await writeOutputMarker(outputStage);
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
