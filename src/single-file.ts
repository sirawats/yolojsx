import { gzipSync, gunzipSync } from "node:zlib";
import { lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { SINGLE_FILE_PAYLOAD_VERSION } from "./constants.js";
import { createCdnImportMap } from "./dependencies.js";
import { RtifactError } from "./errors.js";
import { createSingleFileHtml } from "./templates.js";

const MIME_TYPES = new Map([
  [".avif", "image/avif"],
  [".css", "text/css"],
  [".gif", "image/gif"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".json", "application/json"],
  [".mp3", "audio/mpeg"],
  [".mp4", "video/mp4"],
  [".ogg", "audio/ogg"],
  [".otf", "font/otf"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".ttf", "font/ttf"],
  [".webm", "video/webm"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

type FileMap = Map<string, string>;
type ImportMap = ReturnType<typeof createCdnImportMap>;
type AsyncReplacer = (match: RegExpMatchArray) => Promise<string>;

export interface EmbeddedPayload {
  version: number;
  title: string;
  head: string;
  body: string;
  styles: string[];
  importMap?: ImportMap;
  scriptType: string;
  script: string;
}

function packageError(message: string, cause?: unknown) {
  return new RtifactError(message, { code: "PACK_FAILED", cause });
}

function getAttribute(tag: string, name: string) {
  const match = tag.match(
    new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"),
  );
  return match?.[1] ?? match?.[2] ?? match?.[3];
}

function parseImportMap(tag: string): ImportMap {
  let value: { imports?: Record<string, string> };
  try {
    value = JSON.parse(
      tag.replace(/^<script\b[^>]*>/i, "").replace(/<\/script\s*>$/i, ""),
    ) as { imports?: Record<string, string> };
  } catch (error) {
    throw packageError("Build import map is not valid JSON.", error);
  }

  const expected = createCdnImportMap();
  const imports = value.imports;
  const expectedEntries = Object.entries(expected.imports);
  if (
    !imports ||
    Object.keys(value).length !== 1 ||
    Object.keys(imports).length !== expectedEntries.length ||
    expectedEntries.some(([name, url]) => imports[name] !== url)
  ) {
    throw packageError("Build import map is not the controlled CDN mapping.");
  }
  return { imports: imports as ImportMap["imports"] };
}

function isEmbeddedOrRemote(reference: string) {
  return /^(?:data:|https?:|blob:|\/\/|#)/i.test(reference);
}

function cleanReference(reference: string) {
  const clean = reference.split("#", 1)[0].split("?", 1)[0];
  try {
    return decodeURIComponent(clean).replaceAll("\\", "/");
  } catch {
    return clean.replaceAll("\\", "/");
  }
}

async function listFiles(
  root: string,
  directory = root,
  files: FileMap = new Map(),
): Promise<FileMap> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      throw packageError(
        `Pack input contains an unsupported symbolic link: ${absolute}`,
      );
    }
    if (entry.isDirectory()) {
      await listFiles(root, absolute, files);
    } else if (entry.isFile()) {
      files.set(
        path.relative(root, absolute).split(path.sep).join("/"),
        absolute,
      );
    }
  }
  return files;
}

function resolveFileReference(
  reference: string | undefined,
  fromRelative: string,
  files: FileMap,
  {
    rejectUnsupportedScheme = true,
  }: { rejectUnsupportedScheme?: boolean } = {},
) {
  if (!reference || isEmbeddedOrRemote(reference)) {
    return undefined;
  }
  if (/^[a-z][a-z\d+.-]*:/i.test(reference)) {
    if (rejectUnsupportedScheme) {
      throw packageError(`Unsupported resource URL: ${reference}`);
    }
    return undefined;
  }

  const clean = cleanReference(reference);
  const candidate = clean.startsWith("/")
    ? clean.slice(1)
    : path.posix.normalize(
        path.posix.join(path.posix.dirname(fromRelative), clean),
      );

  if (candidate === ".." || candidate.startsWith("../")) {
    throw packageError(
      `Resource escapes the pack input directory: ${reference}`,
    );
  }
  if (files.has(candidate)) {
    return candidate;
  }

  const suffix = clean.replace(/^\/+/, "");
  const suffixMatches = [...files.keys()].filter(
    (name) => suffix === name || suffix.endsWith(`/${name}`),
  );
  return suffixMatches.length === 1 ? suffixMatches[0] : undefined;
}

async function asDataUrl(file: string) {
  const extension = path.extname(file).toLowerCase();
  const mime = MIME_TYPES.get(extension) ?? "application/octet-stream";
  return `data:${mime};base64,${(await readFile(file)).toString("base64")}`;
}

function requiredFile(files: FileMap, relative: string) {
  const file = files.get(relative);
  if (!file) {
    throw packageError(`Build resource is missing: ${relative}`);
  }
  return file;
}

async function replaceAsync(
  value: string,
  pattern: RegExp,
  replacer: AsyncReplacer,
) {
  const matches = [...value.matchAll(pattern)];
  if (matches.length === 0) {
    return value;
  }
  const replacements = await Promise.all(
    matches.map((match) => replacer(match)),
  );
  let output = "";
  let cursor = 0;
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    output += value.slice(cursor, match.index) + replacements[index];
    cursor = match.index + match[0].length;
  }
  return output + value.slice(cursor);
}

async function inlineCssAssets(
  css: string,
  cssRelative: string,
  files: FileMap,
) {
  const result = await replaceAsync(
    css,
    /url\(\s*(["']?)([^"')]+)\1\s*\)/gi,
    async (match) => {
      const reference = match[2].trim();
      if (isEmbeddedOrRemote(reference)) {
        return match[0];
      }
      const relative = resolveFileReference(reference, cssRelative, files);
      if (!relative) {
        throw packageError(
          `Unresolved CSS resource in ${cssRelative}: ${reference}`,
        );
      }
      return `url("${await asDataUrl(requiredFile(files, relative))}")`;
    },
  );
  for (const match of result.matchAll(/url\(\s*(["']?)([^"')]+)\1\s*\)/gi)) {
    if (!isEmbeddedOrRemote(match[2].trim())) {
      throw packageError(
        `Unsupported local CSS resource remains in ${cssRelative}`,
      );
    }
  }
  return result;
}

async function inlineMarkupAssets(
  markup: string,
  htmlRelative: string,
  files: FileMap,
) {
  return replaceAsync(
    markup,
    /\b(src|poster|href)\s*=\s*(["'])([^"']+)\2/gi,
    async (match) => {
      const [, attribute, quote, reference] = match;
      if (isEmbeddedOrRemote(reference)) {
        return match[0];
      }
      const relative = resolveFileReference(reference, htmlRelative, files);
      if (!relative) {
        if (attribute.toLowerCase() === "href") {
          return match[0];
        }
        throw packageError(`Unresolved HTML resource: ${reference}`);
      }
      return `${attribute}=${quote}${await asDataUrl(requiredFile(files, relative))}${quote}`;
    },
  );
}

async function inlineJavaScriptAssets(
  source: string,
  scriptRelative: string,
  files: FileMap,
  importMap: ImportMap | undefined,
) {
  const result = await replaceAsync(
    source,
    /(["'])([^"'\\\n]+)\1/g,
    async (match) => {
      const reference = match[2];
      if (isEmbeddedOrRemote(reference)) {
        return match[0];
      }
      const relative = resolveFileReference(reference, scriptRelative, files, {
        rejectUnsupportedScheme: false,
      });
      if (!relative || /\.(?:js|mjs|css)$/i.test(relative)) {
        return match[0];
      }
      return `${match[1]}${await asDataUrl(requiredFile(files, relative))}${match[1]}`;
    },
  );

  if (/(?:^|[;}])\s*import\s*\(/m.test(result)) {
    throw packageError(
      `The build uses unsupported additional JavaScript imports: ${scriptRelative}`,
    );
  }
  const imports = [
    ...result.matchAll(
      /(?:^|[;}])\s*import\s*(?:[\w$*{},\s]*?\s*from\s*)?(["'])([^"']+)\1/g,
    ),
  ].map((match) => match[2]);
  if (imports.length > 0 && !importMap) {
    throw packageError(
      `The build uses unsupported additional JavaScript imports: ${scriptRelative}`,
    );
  }
  for (const specifier of imports) {
    if (importMap && !Object.hasOwn(importMap.imports, specifier)) {
      throw packageError(`Unmapped executable import: ${specifier}`);
    }
  }

  const unsupported: [RegExp, string][] = [
    // Prism bundles a dormant worker helper using `<identifier>.filename`.
    [
      /\bnew\s+(?:Shared)?Worker\s*\(\s*(?![A-Za-z_$][\w$]*\.filename\b)/,
      "web workers",
    ],
    [/\bserviceWorker\s*\.\s*register\s*\(/, "service workers"],
    [/\.wasm(?:[?"'])/i, "runtime-loaded WASM"],
    [/\bfetch\s*\(\s*["'](?!https?:|data:|\/\/)/i, "runtime-relative fetches"],
  ];
  for (const [pattern, label] of unsupported) {
    if (pattern.test(result)) {
      throw packageError(
        `The build uses unsupported ${label}: ${scriptRelative}`,
      );
    }
  }
  return result;
}

export async function normalizeBuildDirectory(
  inputDirectory: string,
): Promise<EmbeddedPayload> {
  const inputStat = await lstat(inputDirectory);
  if (!inputStat.isDirectory()) {
    throw packageError(`Pack input is not a directory: ${inputDirectory}`);
  }

  const files = await listFiles(inputDirectory);
  const htmlFile = files.get("index.html");
  if (!htmlFile) {
    throw packageError(
      `Pack input does not contain a readable index.html: ${inputDirectory}`,
    );
  }

  let html: string;
  try {
    html = await readFile(htmlFile, "utf8");
  } catch (error) {
    throw packageError(`Could not read pack input HTML: ${htmlFile}`, error);
  }

  const scriptTags = [
    ...html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi),
  ];
  const entryScripts = scriptTags.filter((match) =>
    getAttribute(match[0], "src"),
  );
  const importMapTags = scriptTags.filter(
    (match) => getAttribute(match[0], "type")?.toLowerCase() === "importmap",
  );
  if (
    entryScripts.length !== 1 ||
    importMapTags.length > 1 ||
    scriptTags.length !== entryScripts.length + importMapTags.length
  ) {
    throw packageError(
      "Pack input must contain one external executable script and at most one controlled import map.",
    );
  }

  const scriptTag = entryScripts[0][0];
  const importMapTag = importMapTags[0]?.[0];
  const importMap = importMapTag ? parseImportMap(importMapTag) : undefined;
  const scriptReference = getAttribute(scriptTag, "src");
  const scriptRelative = resolveFileReference(
    scriptReference,
    "index.html",
    files,
  );
  if (!scriptRelative || !/\.(?:js|mjs)$/i.test(scriptRelative)) {
    throw packageError(
      `Executable entry is not a local JavaScript file: ${scriptReference}`,
    );
  }
  const javaScriptFiles = [...files.keys()].filter((name) =>
    /\.(?:js|mjs)$/i.test(name),
  );
  if (javaScriptFiles.length !== 1) {
    throw packageError(
      `Pack input must contain one executable JavaScript bundle; found ${javaScriptFiles.length}.`,
    );
  }

  let cleanedHtml = html.replace(scriptTag, "");
  if (importMapTag) {
    cleanedHtml = cleanedHtml.replace(importMapTag, "");
  }
  const styles: string[] = [];
  for (const match of [...cleanedHtml.matchAll(/<link\b[^>]*>/gi)]) {
    const tag = match[0];
    const rel = getAttribute(tag, "rel")?.toLowerCase();
    const href = getAttribute(tag, "href");
    if (rel === "modulepreload") {
      cleanedHtml = cleanedHtml.replace(tag, "");
      continue;
    }
    if (rel !== "stylesheet" || !href || isEmbeddedOrRemote(href)) {
      continue;
    }
    const cssRelative = resolveFileReference(href, "index.html", files);
    if (!cssRelative || !cssRelative.endsWith(".css")) {
      throw packageError(
        `Stylesheet is not a readable local CSS file: ${href}`,
      );
    }
    const css = await readFile(requiredFile(files, cssRelative), "utf8");
    styles.push(await inlineCssAssets(css, cssRelative, files));
    cleanedHtml = cleanedHtml.replace(tag, "");
  }

  const titleMatch = cleanedHtml.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i);
  const headMatch = cleanedHtml.match(/<head\b[^>]*>([\s\S]*?)<\/head\s*>/i);
  const bodyMatch = cleanedHtml.match(/<body\b[^>]*>([\s\S]*?)<\/body\s*>/i);
  if (!headMatch || !bodyMatch) {
    throw packageError(
      "Pack input index.html must contain head and body elements.",
    );
  }

  let head = headMatch[1]
    .replace(/<title\b[^>]*>[\s\S]*?<\/title\s*>/gi, "")
    .trim();
  let body = bodyMatch[1].trim();
  head = await inlineMarkupAssets(head, "index.html", files);
  body = await inlineMarkupAssets(body, "index.html", files);

  let script = await readFile(requiredFile(files, scriptRelative), "utf8");
  script = await inlineJavaScriptAssets(
    script,
    scriptRelative,
    files,
    importMap,
  );

  return {
    version: SINGLE_FILE_PAYLOAD_VERSION,
    title: titleMatch?.[1].trim() || "Rtifact",
    head,
    body,
    styles,
    ...(importMap ? { importMap } : {}),
    scriptType: getAttribute(scriptTag, "type") || "module",
    script,
  };
}

export async function createSingleFileArtifact(inputDirectory: string) {
  const payload = await normalizeBuildDirectory(inputDirectory);
  const serialized = JSON.stringify(payload);
  const compressed = gzipSync(Buffer.from(serialized, "utf8"), { level: 9 });
  const html = createSingleFileHtml(
    compressed.toString("base64"),
    SINGLE_FILE_PAYLOAD_VERSION,
  );
  return {
    html,
    bytes: Buffer.byteLength(html),
    compressedBytes: compressed.length,
  };
}

export function readEmbeddedPayload(html: string): EmbeddedPayload {
  const match = html.match(
    /<script id="rtifact-payload" type="application\/octet-stream">([A-Za-z\d+/=]+)<\/script>/,
  );
  if (!match) {
    throw packageError("HTML does not contain a Rtifact payload.");
  }
  return JSON.parse(
    gunzipSync(Buffer.from(match[1], "base64")).toString("utf8"),
  ) as EmbeddedPayload;
}
