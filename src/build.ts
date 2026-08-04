import {
  cp,
  lstat,
  mkdtemp,
  open,
  realpath,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { build, type Plugin } from "vite";
import {
  createCdnImportMap,
  createCoreAliases,
  isCdnExternalImport,
  jsxSourcePlugin,
  resolvePackageImport,
} from "./dependencies.js";
import { formatError, RtifactError } from "./errors.js";
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
  base: string;
  singleFile?: boolean;
  cdn?: boolean;
  theme: Theme;
  themeSource?: string;
  onWarning: (message: string) => unknown;
}

interface BuildApplicationOptions extends Omit<
  TemporaryBuildOptions,
  "singleFile" | "cdn"
> {
  output: string;
}

const MEBIBYTE = 1024 * 1024;
const MAX_TAILWIND_SOURCE_FILES = 2_000;
const MAX_TAILWIND_SOURCE_FILE_BYTES = 4 * MEBIBYTE;
const MAX_TAILWIND_SOURCE_BYTES = 32 * MEBIBYTE;
const TAILWIND_SOURCE_EXTENSIONS = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
]);

interface TailwindSourceSnapshot {
  files: Map<string, string>;
  contents: string;
}

function sourceFileFromId(id: string, allowDependency = false) {
  if (id.startsWith("\0") || id.includes("?")) return undefined;
  const file = path.normalize(id);
  if (
    !path.isAbsolute(file) ||
    !TAILWIND_SOURCE_EXTENSIONS.has(path.extname(file).toLowerCase()) ||
    (!allowDependency && file.split(path.sep).includes("node_modules"))
  ) {
    return undefined;
  }
  return file;
}

function isDiscoveryExternal(id: string) {
  if (id.startsWith("\0")) return false;
  if (path.isAbsolute(id)) {
    const file = path.normalize(id);
    return (
      file.split(path.sep).includes("node_modules") ||
      !TAILWIND_SOURCE_EXTENSIONS.has(path.extname(file).toLowerCase())
    );
  }
  if (!id.startsWith(".")) return true;
  const extension = path.extname(id).toLowerCase();
  return extension !== "" && !TAILWIND_SOURCE_EXTENSIONS.has(extension);
}

function sourceLimitError(message: string) {
  return new RtifactError(
    `Tailwind source graph ${message}. Keep generated or unrelated code outside the application graph.`,
    { code: "TAILWIND_SOURCE_LIMIT" },
  );
}

async function createTailwindSourceSnapshot(
  entry: string,
  themeSource?: string,
): Promise<TailwindSourceSnapshot> {
  const files = new Map<string, string>();
  const pending = new Map<string, Promise<string>>();
  let fileCount = 0;
  let totalBytes = 0;

  async function loadSource(id: string, allowDependency = false) {
    const file = sourceFileFromId(id, allowDependency);
    if (!file) return null;
    const loaded = files.get(file);
    if (loaded !== undefined) return loaded;
    const loading = pending.get(file);
    if (loading) return loading;

    const promise = (async () => {
      const fileStat = await lstat(file);
      if (!fileStat.isFile() || fileStat.isSymbolicLink()) {
        throw sourceLimitError(`contains an unsupported source: ${file}`);
      }
      if (fileStat.size > MAX_TAILWIND_SOURCE_FILE_BYTES) {
        throw sourceLimitError(`file exceeds 4 MiB: ${file}`);
      }
      if (fileCount + 1 > MAX_TAILWIND_SOURCE_FILES) {
        throw sourceLimitError(
          `exceeds ${MAX_TAILWIND_SOURCE_FILES.toLocaleString("en-US")} files`,
        );
      }
      if (totalBytes + fileStat.size > MAX_TAILWIND_SOURCE_BYTES) {
        throw sourceLimitError("exceeds 32 MiB in total");
      }
      fileCount += 1;
      totalBytes += fileStat.size;

      const handle = await open(file, "r");
      let source: Buffer;
      try {
        source = Buffer.alloc(fileStat.size + 1);
        let offset = 0;
        while (offset < source.length) {
          const { bytesRead } = await handle.read(
            source,
            offset,
            source.length - offset,
            offset,
          );
          if (bytesRead === 0) break;
          offset += bytesRead;
        }
        if (offset > fileStat.size) {
          throw sourceLimitError(`file changed while reading: ${file}`);
        }
        source = source.subarray(0, offset);
      } finally {
        await handle.close();
      }
      const actualBytes = source.length;
      if (
        totalBytes - fileStat.size + actualBytes >
        MAX_TAILWIND_SOURCE_BYTES
      ) {
        throw sourceLimitError("exceeds 32 MiB in total");
      }
      totalBytes += actualBytes - fileStat.size;
      const contents = source.toString("utf8");
      files.set(file, contents);
      return contents;
    })();
    pending.set(file, promise);
    try {
      return await promise;
    } finally {
      pending.delete(file);
    }
  }

  if (themeSource) await loadSource(themeSource, true);
  await build({
    root: path.dirname(entry),
    configFile: false,
    envDir: false,
    publicDir: false,
    appType: "custom",
    logLevel: "silent",
    plugins: [
      jsxSourcePlugin,
      {
        name: "rtifact-tailwind-source-graph",
        enforce: "pre",
        load(id) {
          return loadSource(id);
        },
      },
      react(),
    ],
    build: {
      write: false,
      copyPublicDir: false,
      minify: false,
      cssMinify: false,
      rolldownOptions: {
        input: entry,
        external: isDiscoveryExternal,
        output: { codeSplitting: false },
      },
    },
  });

  const contents = [...files.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, source]) => source)
    .join("\n");
  if (Buffer.byteLength(contents) > MAX_TAILWIND_SOURCE_BYTES) {
    throw sourceLimitError("snapshot exceeds 32 MiB in total");
  }
  return { files, contents };
}

function createSourceSnapshotPlugin(files: Map<string, string>): Plugin {
  return {
    name: "rtifact-source-snapshot",
    enforce: "pre",
    load(id) {
      const file = sourceFileFromId(id, true);
      return file ? (files.get(file) ?? null) : null;
    },
  };
}

async function createWorkspace(
  tailwindSources: string,
  theme: Theme,
  cdn: boolean,
) {
  const temporaryWorkspace = await mkdtemp(
    path.join(os.tmpdir(), "rtifact-work-"),
  );
  const workspace = await realpath(temporaryWorkspace);
  const themeCssPath = path.join(workspace, "theme.css");
  const tailwindSourcePath = path.join(workspace, "tailwind-sources.jsx");
  await Promise.all([
    writeFile(
      path.join(workspace, "index.html"),
      createHtml(cdn ? createCdnImportMap() : undefined),
      "utf8",
    ),
    writeFile(path.join(workspace, "main.jsx"), createMainModule(), "utf8"),
    writeFile(themeCssPath, renderThemeCss(theme), "utf8"),
    writeFile(tailwindSourcePath, tailwindSources, "utf8"),
    writeFile(
      path.join(workspace, "styles.css"),
      createTailwindStyles(
        workspace,
        tailwindSourcePath,
        resolvePackageImport("tailwindcss/index.css"),
        resolveFoundationStylesheet(),
        themeCssPath,
      ),
      "utf8",
    ),
  ]);
  return workspace;
}

function asBuildError(error: unknown) {
  if (error instanceof RtifactError) {
    return error;
  }
  return new RtifactError(`Build failed: ${formatError(error)}`, {
    code: "BUILD_FAILED",
    cause: error,
  });
}

export async function withTemporaryApplicationBuild<T>(
  {
    entry,
    base,
    singleFile = false,
    cdn = false,
    theme,
    themeSource,
    onWarning,
  }: TemporaryBuildOptions,
  consume: (workspaceOutput: string) => T | Promise<T>,
): Promise<T> {
  let workspace: string | undefined;

  try {
    const sourceSnapshot = await createTailwindSourceSnapshot(
      entry,
      themeSource,
    );
    workspace = await createWorkspace(sourceSnapshot.contents, theme, cdn);
    const workspaceOutput = path.join(workspace, "dist");
    const prismThemes = await loadPrismThemeCatalog();

    await build({
      root: workspace,
      base,
      configFile: false,
      envDir: false,
      publicDir: false,
      appType: "spa",
      logLevel: "silent",
      plugins: [
        jsxSourcePlugin,
        createSourceSnapshotPlugin(sourceSnapshot.files),
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
  output,
  base,
  theme,
  themeSource,
  onWarning,
}: BuildApplicationOptions) {
  let stage: string | undefined;

  try {
    stage = await createOutputStage(output);
    const outputStage = stage;
    await withTemporaryApplicationBuild(
      { entry, base, theme, themeSource, onWarning },
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
