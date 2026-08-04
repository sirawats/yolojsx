import { rmSync } from "node:fs";
import { mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { createServer } from "vite";
import {
  createCoreAliases,
  jsxSourcePlugin,
  resolvePackageImport,
} from "../src/dependencies.js";
import { formatError } from "../src/errors.js";
import { isWithin, resolveAndValidateEntry } from "../src/paths.js";
import { loadPrismThemeCatalog } from "../src/prism-themes.js";
import {
  createEntryPlugin,
  createHtml,
  createMainModule,
  createTailwindStyles,
} from "../src/templates.js";
import { resolveFoundationStylesheet } from "../src/theme-css.js";
import { resolveThemeSelection } from "../src/theme-modules.js";
import { renderThemeCss } from "../src/themes.js";

const repository = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

async function startDevServer() {
  const entryArg = process.argv[2] || "website/index.tsx";
  const themeArg = process.argv[3] || "default";
  const entry = await resolveAndValidateEntry(entryArg, repository);
  const sourceDirectory = isWithin(repository, entry)
    ? repository
    : path.dirname(entry);
  const { theme, source: themeSource } = await resolveThemeSelection(
    themeArg,
    repository,
  );
  const prismThemes = await loadPrismThemeCatalog();

  const temporaryWorkspace = await mkdtemp(
    path.join(os.tmpdir(), "rtifact-dev-"),
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
        path.join(sourceDirectory, "**/*.{js,jsx,ts,tsx}"),
        resolvePackageImport("tailwindcss/index.css"),
        resolveFoundationStylesheet(),
        themeCssPath,
        themeSource,
      ),
      "utf8",
    ),
  ]);

  const cleanup = async () => {
    try {
      await rm(workspace, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors on exit
    }
  };

  const shutdown = () => {
    void cleanup().finally(() => process.exit(0));
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  process.on("exit", () => {
    rmSync(workspace, { recursive: true, force: true });
  });

  const server = await createServer({
    root: workspace,
    configFile: false,
    envDir: false,
    publicDir: false,
    appType: "spa",
    server: {
      host: true,
      fs: {
        allow: [repository, workspace],
      },
    },
    plugins: [
      jsxSourcePlugin,
      createEntryPlugin(entry, theme, prismThemes, (message) => {
        process.stderr.write(`Warning: ${message}\n`);
      }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: createCoreAliases(),
      dedupe: ["react", "react-dom"],
    },
  });

  await server.listen();
  server.printUrls();
  process.stdout.write(
    `\n  Rtifact dev server running for ${path.relative(repository, entry)}\n\n`,
  );
}

startDevServer().catch((error) => {
  process.stderr.write(`Failed to start dev server: ${formatError(error)}\n`);
  process.exit(1);
});
