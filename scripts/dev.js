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
  resolvePackageImport,
} from "../src/dependencies.js";
import { isWithin, resolveAndValidateEntry } from "../src/paths.js";
import { loadPrismThemeCatalog } from "../src/prism-themes.js";
import {
  createEntryPlugin,
  createHtml,
  createMainModule,
  createTailwindStyles,
} from "../src/templates.js";
import { resolveFoundationStylesheet } from "../src/theme-css.js";
import { renderThemeCss, resolveTheme } from "../src/themes.js";

const repository = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

async function startDevServer() {
  const entryArg = process.argv[2] || "website/index.jsx";
  const entry = await resolveAndValidateEntry(entryArg, repository);
  const sourceDirectory = isWithin(repository, entry)
    ? repository
    : path.dirname(entry);
  const theme = resolveTheme("default");
  const prismThemes = await loadPrismThemeCatalog();

  const temporaryWorkspace = await mkdtemp(
    path.join(os.tmpdir(), "yolojsx-dev-"),
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
        undefined,
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

  process.on("SIGINT", async () => {
    await cleanup();
    process.exit(0);
  });
  process.on("SIGTERM", async () => {
    await cleanup();
    process.exit(0);
  });
  process.on("exit", () => {
    cleanup();
  });

  const server = await createServer({
    root: workspace,
    configFile: false,
    envFile: false,
    publicDir: false,
    appType: "spa",
    server: {
      host: true,
      fs: {
        allow: [repository, workspace],
      },
    },
    plugins: [
      createEntryPlugin(entry, theme, prismThemes, (message) =>
        process.stderr.write(`Warning: ${message}\n`),
      ),
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
    `\n  yolojsx dev server running for ${path.relative(repository, entry)}\n\n`,
  );
}

startDevServer().catch((error) => {
  process.stderr.write(`Failed to start dev server: ${error.stack || error}\n`);
  process.exit(1);
});
