import { readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const prismThemesDirectory = path.join(
  path.dirname(require.resolve("prism-themes")),
  "themes",
);
const prismDirectory = path.dirname(
  require.resolve("prismjs/themes/prism.css"),
);
export const DEFAULT_PRISM_THEME = "prism";
let catalogPromise: Promise<Map<string, string>> | undefined;

function discover(directory: string, files: string[]): [string, string][] {
  return files
    .filter((file) => file.startsWith("prism") && file.endsWith(".css"))
    .map((file) => file.slice(0, -4))
    .filter((name) => !name.endsWith(".min"))
    .map((name) => [
      name === "prism" ? name : name.slice(6),
      path.join(directory, `${name}.css`),
    ]);
}

export function loadPrismThemeCatalog() {
  catalogPromise ??= Promise.all([
    readdir(prismDirectory),
    readdir(prismThemesDirectory),
  ]).then(
    ([prismFiles, prismThemeFiles]) =>
      new Map(
        [
          ...discover(prismDirectory, prismFiles),
          ...discover(prismThemesDirectory, prismThemeFiles),
        ].sort(([left], [right]) => left.localeCompare(right)),
      ),
  );
  return catalogPromise;
}

export async function renderPrismThemeCatalog() {
  return `${[...(await loadPrismThemeCatalog()).keys()].join("\n")}\n`;
}
