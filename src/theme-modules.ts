import path from "node:path";
import react from "@vitejs/plugin-react";
import { build, normalizePath, type Plugin } from "vite";
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
      plugins: [jsxSourcePlugin, createThemeModulePlugin(themeSource), react()],
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
  const preset = findTheme(value);
  if (preset) return { theme: preset };
  if (!looksLikeThemePath(value)) return { theme: resolveTheme(value) };

  const source = await resolveAndValidateThemeModule(value, cwd);
  return {
    theme: await loadThemeModule(source, cwd),
    source,
  };
}
