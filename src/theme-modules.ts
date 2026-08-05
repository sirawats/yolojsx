import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { build, normalizePath, type Plugin } from "vite";
import { createBuildResourceBudgetPlugin } from "./build.js";
import { createCoreAliases, jsxSourcePlugin } from "./dependencies.js";
import { formatError, RtifactError } from "./errors.js";
import { resolveAndValidateThemeModule } from "./paths.js";
import {
  createTheme,
  findTheme,
  resolveTheme,
  validateTheme,
  type Theme,
  type ThemeDefinition,
} from "./themes.js";

const VIRTUAL_THEME_ID = "virtual:rtifact-theme-default";
const RESOLVED_VIRTUAL_THEME_ID = `\0${VIRTUAL_THEME_ID}`;
let loadSequence = 0;

export interface ThemeSelection {
  theme: Theme;
  source?: string;
}

export type ThemeInput =
  { kind: "preset"; value: string } | { kind: "module"; source: string };

function createThemeModulePlugin(themeSource: string): Plugin {
  return {
    name: "rtifact-theme-module",
    resolveId(id) {
      return id === VIRTUAL_THEME_ID ? RESOLVED_VIRTUAL_THEME_ID : null;
    },
    load(id) {
      if (id !== RESOLVED_VIRTUAL_THEME_ID) return null;
      return `import * as selectedTheme from ${JSON.stringify(normalizePath(themeSource))};
export default selectedTheme.default;
`;
    },
  };
}

function findEntryCode(result: Awaited<ReturnType<typeof build>>) {
  const builds = Array.isArray(result) ? result : [result];
  for (const buildResult of builds) {
    if (!("output" in buildResult)) continue;
    const entry = buildResult.output.find(
      (item) => item.type === "chunk" && item.isEntry,
    );
    if (entry?.type === "chunk") return entry.code;
  }
  throw new Error("Vite did not emit a theme module entry.");
}

export async function loadThemeModule(
  themeSource: string,
  cwd: string,
): Promise<Theme> {
  let definition: unknown;
  try {
    const result = await build({
      root: cwd,
      configFile: false,
      envDir: false,
      publicDir: false,
      appType: "custom",
      logLevel: "silent",
      plugins: [
        jsxSourcePlugin,
        createBuildResourceBudgetPlugin(new Map()),
        createThemeModulePlugin(themeSource),
        react(),
      ],
      resolve: {
        alias: createCoreAliases(),
        dedupe: ["react", "react-dom"],
      },
      ssr: {
        noExternal: true,
      },
      build: {
        write: false,
        ssr: true,
        copyPublicDir: false,
        rolldownOptions: {
          input: VIRTUAL_THEME_ID,
          output: {
            codeSplitting: false,
            format: "es",
          },
        },
      },
    });
    const code = findEntryCode(result);
    const encoded = Buffer.from(code).toString("base64");
    const loaded = (await import(
      `data:text/javascript;base64,${encoded}#${loadSequence++}`
    )) as { default?: unknown };
    definition = loaded.default;
  } catch (error) {
    throw new RtifactError(
      `Could not load theme module ${themeSource}: ${formatError(error)}`,
      { code: "INVALID_THEME", cause: error },
    );
  }

  if (
    definition === null ||
    typeof definition !== "object" ||
    Array.isArray(definition)
  ) {
    throw new RtifactError(
      `Theme module must default-export a theme definition object: ${themeSource}`,
      { code: "INVALID_THEME" },
    );
  }

  try {
    const theme = createTheme(definition as ThemeDefinition);
    validateTheme(theme);
    return theme;
  } catch (error) {
    throw new RtifactError(
      `Invalid theme module ${themeSource}: ${formatError(error)}`,
      { code: "INVALID_THEME", cause: error },
    );
  }
}

function looksLikeThemePath(value: string) {
  return (
    path.isAbsolute(value) ||
    value.startsWith(".") ||
    value.includes("/") ||
    value.includes("\\") ||
    path.extname(value) !== ""
  );
}

export async function resolveThemeSelection(
  value: string,
  cwd: string,
): Promise<ThemeSelection> {
  return loadThemeInput(await resolveThemeInput(value, cwd), cwd);
}

export async function resolveThemeInput(
  value: string,
  cwd: string,
): Promise<ThemeInput> {
  if (findTheme(value) || !looksLikeThemePath(value)) {
    return { kind: "preset", value };
  }
  return {
    kind: "module",
    source: await resolveAndValidateThemeModule(value, cwd),
  };
}

export async function loadThemeInput(
  input: ThemeInput,
  cwd: string,
): Promise<ThemeSelection> {
  if (input.kind === "preset") {
    return { theme: findTheme(input.value) ?? resolveTheme(input.value) };
  }
  return {
    theme: await loadThemeModule(input.source, cwd),
    source: input.source,
  };
}

export async function readBuiltInThemeSource(themeId: string): Promise<string> {
  const baseDir = path.dirname(fileURLToPath(import.meta.url));
  const jsxPath = path.join(baseDir, "themes", `${themeId}.jsx`);
  try {
    return await readFile(jsxPath, "utf8");
  } catch {
    const jsPath = path.join(baseDir, "themes", `${themeId}.js`);
    return await readFile(jsPath, "utf8");
  }
}

export async function getThemeSource(
  value: string,
  cwd: string = process.cwd(),
): Promise<string> {
  const themeInput = await resolveThemeInput(value, cwd);
  if (themeInput.kind === "module") {
    return await readFile(themeInput.source, "utf8");
  }
  const theme = resolveTheme(themeInput.value);
  return await readBuiltInThemeSource(theme.id);
}
