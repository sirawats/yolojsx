import { createHash } from "node:crypto";
import { cp, lstat, mkdtemp, realpath, writeFile } from "node:fs/promises";
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
import { formatError, hasErrorCode, RtifactError } from "./errors.js";
import {
  cleanupDirectory,
  commitOutput,
  createOutputStage,
  type OutputAuthorization,
  writeOutputMarker,
} from "./output.js";
import { loadPrismThemeCatalog } from "./prism-themes.js";
import { BUILD_RESOURCE_LIMITS } from "./resource-limits.js";
import { readStableFile, type StableFileIdentity } from "./stable-files.js";
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
  workspaceRoot?: string;
  onWarning: (message: string) => unknown;
}

interface BuildApplicationOptions extends Omit<
  TemporaryBuildOptions,
  "singleFile" | "cdn"
> {
  output: string;
  outputAuthorization: OutputAuthorization;
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
const STABLE_BUILD_TEXT_EXTENSIONS = new Set([
  ...TAILWIND_SOURCE_EXTENSIONS,
  ".css",
  ".json",
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
      const fileStat = await lstat(file, { bigint: true });
      if (!fileStat.isFile() || fileStat.isSymbolicLink()) {
        throw sourceLimitError(`contains an unsupported source: ${file}`);
      }
      if (fileStat.size > BigInt(MAX_TAILWIND_SOURCE_FILE_BYTES)) {
        throw sourceLimitError(`file exceeds 4 MiB: ${file}`);
      }
      const fileBytes = Number(fileStat.size);
      if (fileCount + 1 > MAX_TAILWIND_SOURCE_FILES) {
        throw sourceLimitError(
          `exceeds ${MAX_TAILWIND_SOURCE_FILES.toLocaleString("en-US")} files`,
        );
      }
      if (totalBytes + fileBytes > MAX_TAILWIND_SOURCE_BYTES) {
        throw sourceLimitError("exceeds 32 MiB in total");
      }
      fileCount += 1;
      totalBytes += fileBytes;

      let source: Buffer;
      try {
        source = await readStableFile(
          file,
          MAX_TAILWIND_SOURCE_FILE_BYTES,
          fileStat,
        );
      } catch (error) {
        throw sourceLimitError(
          `file changed while reading: ${file} (${formatError(error)})`,
        );
      }
      const actualBytes = source.length;
      if (totalBytes - fileBytes + actualBytes > MAX_TAILWIND_SOURCE_BYTES) {
        throw sourceLimitError("exceeds 32 MiB in total");
      }
      totalBytes += actualBytes - fileBytes;
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

function disablePrismWorkerPlugin(): Plugin {
  return {
    name: "rtifact-disable-prism-worker",
    enforce: "pre",
    transform(source, id) {
      if (!id.split("?", 1)[0].endsWith("/prismjs/prism.js")) return null;
      const workerBranch = "if (async && _self.Worker) {";
      if (!source.includes(workerBranch)) return null;
      return source.replace(workerBranch, "if (false) {");
    },
  };
}

function buildResourceError(message: string) {
  return new RtifactError(
    `Build resource ${message}. Reduce imported dependencies or assets.`,
    { code: "BUILD_RESOURCE_LIMIT" },
  );
}

export function createBuildResourceBudgetPlugin(
  sourceSnapshot: Map<string, string>,
): Plugin {
  const approvedFiles = new Map<string, StableFileIdentity>();
  const deferredFiles = new Map<
    string,
    { identity: StableFileIdentity; digest: string }
  >();
  const physicalFiles = new Map<string, bigint>();
  let fileCount = 0;
  let inputBytes = 0;

  async function readApproved(file: string, identity: StableFileIdentity) {
    try {
      return await readStableFile(
        file,
        BUILD_RESOURCE_LIMITS.fileBytes,
        identity,
      );
    } catch (error) {
      throw buildResourceError(
        `changed while loading: ${file} (${formatError(error)})`,
      );
    }
  }

  async function revalidateDeferred(
    file: string,
    approved: { identity: StableFileIdentity; digest: string },
  ) {
    const contents = await readApproved(file, approved.identity);
    const digest = createHash("sha256").update(contents).digest("hex");
    if (digest !== approved.digest) {
      throw buildResourceError(`changed while loading: ${file}`);
    }
  }

  return {
    name: "rtifact-build-resource-budget",
    enforce: "pre",
    async load(id) {
      if (id.startsWith("\0")) return null;
      const file = path.normalize(id.split("?", 1)[0]);
      if (!path.isAbsolute(file)) return null;
      let fileIdentity = approvedFiles.get(file);
      if (!fileIdentity) {
        let fileStat;
        try {
          fileStat = await lstat(file, { bigint: true });
        } catch (error) {
          if (hasErrorCode(error, "ENOENT")) return null;
          throw error;
        }
        if (!fileStat.isFile() || fileStat.isSymbolicLink()) return null;
        if (fileStat.size > BigInt(BUILD_RESOURCE_LIMITS.fileBytes)) {
          throw buildResourceError(`exceeds 16 MiB: ${file}`);
        }
        fileIdentity = {
          dev: fileStat.dev,
          ino: fileStat.ino,
          size: fileStat.size,
        };
        approvedFiles.set(file, fileIdentity);
        const identity = `${fileStat.dev}:${fileStat.ino}`;
        const approvedSize = physicalFiles.get(identity);
        if (approvedSize === undefined) {
          physicalFiles.set(identity, fileStat.size);
          fileCount += 1;
          inputBytes += Number(fileStat.size);
        } else if (approvedSize !== fileStat.size) {
          throw buildResourceError(`changed while accounting: ${file}`);
        }
        if (fileCount > BUILD_RESOURCE_LIMITS.files) {
          throw buildResourceError(
            `graph exceeds ${BUILD_RESOURCE_LIMITS.files.toLocaleString("en-US")} files`,
          );
        }
        if (inputBytes > BUILD_RESOURCE_LIMITS.inputBytes) {
          throw buildResourceError("graph exceeds 128 MiB in total");
        }
      }
      const snapshotted = sourceSnapshot.get(file);
      if (!id.includes("?") && snapshotted !== undefined) return snapshotted;
      if (
        id.includes("?") ||
        !STABLE_BUILD_TEXT_EXTENSIONS.has(path.extname(file).toLowerCase())
      ) {
        const contents = await readApproved(file, fileIdentity);
        const digest = createHash("sha256").update(contents).digest("hex");
        const existing = deferredFiles.get(file);
        if (existing && digest !== existing.digest) {
          throw buildResourceError(`changed while loading: ${file}`);
        }
        deferredFiles.set(file, existing ?? { identity: fileIdentity, digest });
        return null;
      }
      return (await readApproved(file, fileIdentity)).toString("utf8");
    },
    async transform(_source, id) {
      const file = path.normalize(id.split("?", 1)[0]);
      const approved = deferredFiles.get(file);
      if (approved) await revalidateDeferred(file, approved);
      return null;
    },
    async generateBundle(_options, bundle) {
      await Promise.all(
        [...deferredFiles].map(([file, approved]) =>
          revalidateDeferred(file, approved),
        ),
      );
      let outputBytes = 0;
      for (const [name, item] of Object.entries(bundle)) {
        const bytes =
          item.type === "chunk"
            ? Buffer.byteLength(item.code)
            : Buffer.byteLength(item.source);
        if (bytes > BUILD_RESOURCE_LIMITS.outputFileBytes) {
          throw buildResourceError(`generated file exceeds 32 MiB: ${name}`);
        }
        outputBytes += bytes;
        if (outputBytes > BUILD_RESOURCE_LIMITS.outputBytes) {
          throw buildResourceError("generated output exceeds 128 MiB in total");
        }
      }
    },
  };
}

async function createWorkspace(
  tailwindSources: string,
  theme: Theme,
  cdn: boolean,
  workspaceRoot?: string,
) {
  const temporaryWorkspace = await mkdtemp(
    path.join(workspaceRoot ?? os.tmpdir(), "rtifact-work-"),
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
    workspaceRoot,
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
    workspace = await createWorkspace(
      sourceSnapshot.contents,
      theme,
      cdn,
      workspaceRoot,
    );
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
        createBuildResourceBudgetPlugin(sourceSnapshot.files),
        createSourceSnapshotPlugin(sourceSnapshot.files),
        createEntryPlugin(entry, theme, prismThemes, onWarning),
        ...(singleFile ? [disablePrismWorkerPlugin()] : []),
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
  outputAuthorization,
  base,
  theme,
  themeSource,
  onWarning,
}: BuildApplicationOptions) {
  let stage: string | undefined;

  try {
    stage = await createOutputStage(output, outputAuthorization);
    const outputStage = stage;
    await withTemporaryApplicationBuild(
      { entry, base, theme, themeSource, onWarning },
      async (workspaceOutput) => {
        await cp(workspaceOutput, outputStage, { recursive: true });
        await writeOutputMarker(outputStage);
      },
    );
    await commitOutput(stage, output, outputAuthorization);
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
