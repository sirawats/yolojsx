import { gzipSync, gunzipSync } from "node:zlib";
import { lstat, opendir } from "node:fs/promises";
import path from "node:path";
import { parseAstAsync } from "rolldown/parseAst";
import { SINGLE_FILE_PAYLOAD_VERSION } from "./constants.js";
import { createCdnImportMap } from "./dependencies.js";
import { hasErrorCode, RtifactError } from "./errors.js";
import { BUILD_RESOURCE_LIMITS } from "./resource-limits.js";
import {
  readStableFile,
  StableFileError,
  type StableFileIdentity,
} from "./stable-files.js";
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

export const PACK_INPUT_LIMITS = {
  files: BUILD_RESOURCE_LIMITS.packFiles,
  fileBytes: BUILD_RESOURCE_LIMITS.fileBytes,
  totalBytes: BUILD_RESOURCE_LIMITS.packInputBytes,
  normalizedBytes: BUILD_RESOURCE_LIMITS.normalizedBytes,
  artifactBytes: BUILD_RESOURCE_LIMITS.artifactBytes,
} as const;

export interface PackFile {
  absolute: string;
  identity: StableFileIdentity;
}
type FileMap = Map<string, PackFile>;
export interface PackInventory {
  files: FileMap;
  physicalBytes: number;
}
type ImportMap = ReturnType<typeof createCdnImportMap>;
type AsyncReplacer = (match: RegExpMatchArray) => Promise<string>;
type AssetEncoder = (file: PackFile) => Promise<string>;
type AstNode = { type: string; [key: string]: unknown };
interface FileIndexState {
  count: number;
  bytes: number;
  identities: Map<string, bigint>;
}

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
  state: FileIndexState = { count: 0, bytes: 0, identities: new Map() },
): Promise<FileMap> {
  const entries = [];
  const directoryHandle = await opendir(directory);
  for await (const entry of directoryHandle) {
    state.count += 1;
    if (state.count > PACK_INPUT_LIMITS.files) {
      throw packageError(
        `Pack input exceeds ${PACK_INPUT_LIMITS.files.toLocaleString("en-US")} inventory entries.`,
      );
    }
    entries.push(entry);
  }
  entries.sort((left, right) =>
    left.name < right.name ? -1 : left.name > right.name ? 1 : 0,
  );
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      throw packageError(
        `Pack input contains an unsupported symbolic link: ${absolute}`,
      );
    }
    if (entry.isDirectory()) {
      await listFiles(root, absolute, files, state);
    } else if (entry.isFile()) {
      const relative = path.relative(root, absolute).split(path.sep).join("/");
      const fileStat = await lstat(absolute, { bigint: true });
      if (!fileStat.isFile() || fileStat.isSymbolicLink()) {
        throw packageError(
          `Pack input contains an unsupported file: ${absolute}`,
        );
      }
      if (Buffer.byteLength(relative) > 1_024) {
        throw packageError(`Pack input path exceeds 1,024 bytes: ${absolute}`);
      }
      if (fileStat.size > BigInt(PACK_INPUT_LIMITS.fileBytes)) {
        throw packageError(`Pack input file exceeds 16 MiB: ${absolute}`);
      }
      const identityKey = `${fileStat.dev}:${fileStat.ino}`;
      const approvedSize = state.identities.get(identityKey);
      if (approvedSize === undefined) {
        state.identities.set(identityKey, fileStat.size);
        state.bytes += Number(fileStat.size);
      } else if (approvedSize !== fileStat.size) {
        throw packageError(`Pack input changed during inventory: ${absolute}`);
      }

      if (state.bytes > PACK_INPUT_LIMITS.totalBytes) {
        throw packageError("Pack input exceeds 64 MiB in total.");
      }
      files.set(relative, {
        absolute: path.resolve(absolute),
        identity: {
          dev: fileStat.dev,
          ino: fileStat.ino,
          size: fileStat.size,
        },
      });
    }
  }
  return files;
}

export async function inventoryPackFiles(root: string): Promise<PackInventory> {
  const state: FileIndexState = { count: 0, bytes: 0, identities: new Map() };
  const files = await listFiles(root, root, new Map(), state);
  return { files, physicalBytes: state.bytes };
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

export async function readPackFile(file: PackFile) {
  try {
    return await readStableFile(
      file.absolute,
      PACK_INPUT_LIMITS.fileBytes,
      file.identity,
    );
  } catch (error) {
    if (error instanceof StableFileError && error.reason === "changed") {
      throw packageError(
        `Pack input changed after inventory: ${file.absolute}`,
        error,
      );
    }
    if (error instanceof StableFileError && error.reason === "too-large") {
      throw packageError(
        `Pack input file exceeds 16 MiB: ${file.absolute}`,
        error,
      );
    }
    if (error instanceof StableFileError && error.reason === "unsupported") {
      throw packageError(
        `Pack input is not a regular non-symbolic-link file: ${file.absolute}`,
        error,
      );
    }
    if (hasErrorCode(error, "ENOENT")) {
      throw packageError(
        `Pack input disappeared after inventory: ${file.absolute}`,
        error,
      );
    }
    if (hasErrorCode(error, "EACCES") || hasErrorCode(error, "EPERM")) {
      throw packageError(`Pack input is not readable: ${file.absolute}`, error);
    }
    throw packageError(
      `Could not read pack input file: ${file.absolute}`,
      error,
    );
  }
}

async function asDataUrl(file: PackFile) {
  const extension = path.extname(file.absolute).toLowerCase();
  const mime = MIME_TYPES.get(extension) ?? "application/octet-stream";
  return `data:${mime};base64,${(await readPackFile(file)).toString("base64")}`;
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
  maxJsonBytes = Number.POSITIVE_INFINITY,
) {
  const output: string[] = [];
  let outputJsonBytes = 2;
  let cursor = 0;
  let matched = false;
  const append = (part: string) => {
    outputJsonBytes += jsonStringBytes(part) - 2;
    if (outputJsonBytes > maxJsonBytes) {
      throw packageError("Normalized portable payload exceeds 96 MiB.");
    }
    output.push(part);
  };
  for (const match of value.matchAll(pattern)) {
    matched = true;
    append(value.slice(cursor, match.index));
    append(await replacer(match));
    cursor = match.index + match[0].length;
  }
  if (!matched) {
    if (jsonStringBytes(value) > maxJsonBytes) {
      throw packageError("Normalized portable payload exceeds 96 MiB.");
    }
    return value;
  }
  append(value.slice(cursor));
  return output.join("");
}

function walkAst(node: unknown, visit: (node: AstNode) => void) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const child of node) walkAst(child, visit);
    return;
  }
  const astNode = node as AstNode;
  if (typeof astNode.type === "string") visit(astNode);
  for (const [key, child] of Object.entries(astNode)) {
    if (key !== "parent") walkAst(child, visit);
  }
}

async function validateJavaScriptGraph(
  source: string,
  scriptRelative: string,
  importMap: ImportMap | undefined,
) {
  let program: unknown;
  try {
    program = await parseAstAsync(source, { lang: "js" });
  } catch (error) {
    throw packageError(
      `Could not parse executable bundle: ${scriptRelative}`,
      error,
    );
  }

  let unsupported: string | undefined;
  walkAst(program, (node) => {
    if (unsupported) return;
    if (node.type === "ImportExpression") {
      unsupported = "additional JavaScript imports";
      return;
    }
    if (
      node.type === "ImportDeclaration" ||
      node.type === "ExportAllDeclaration" ||
      node.type === "ExportNamedDeclaration"
    ) {
      const sourceNode = node.source as { value?: unknown } | null | undefined;
      if (!sourceNode) return;
      const specifier = sourceNode.value;
      if (
        typeof specifier !== "string" ||
        !importMap ||
        !Object.hasOwn(importMap.imports, specifier)
      ) {
        unsupported =
          typeof specifier === "string"
            ? `unmapped executable import:${specifier}`
            : "additional JavaScript imports";
      }
      return;
    }
    if (node.type === "NewExpression") {
      const callee = node.callee as
        { type?: string; name?: string } | undefined;
      if (
        callee?.type === "Identifier" &&
        (callee.name === "Worker" || callee.name === "SharedWorker")
      ) {
        unsupported = "web workers";
      }
      return;
    }
    if (node.type !== "CallExpression") return;
    const callee = node.callee as AstNode | undefined;
    if (callee?.type === "Identifier" && callee.name === "fetch") {
      const first = (node.arguments as AstNode[] | undefined)?.[0];
      const value = first?.value;
      const property = first?.property as { name?: string } | undefined;
      const reactResourceHintFetch =
        first?.type === "MemberExpression" &&
        first.computed === false &&
        property?.name === "href" &&
        (node.arguments as AstNode[] | undefined)?.length === 2;
      if (
        !reactResourceHintFetch &&
        (first?.type !== "Literal" ||
          typeof value !== "string" ||
          !/^(?:data:|https?:|\/\/)/i.test(value))
      ) {
        unsupported = "runtime-relative fetches";
      }
      return;
    }
    if (callee?.type !== "MemberExpression") return;
    const property = callee.property as
      { name?: string; value?: unknown } | undefined;
    const object = callee.object as AstNode | undefined;
    const objectProperty = object?.property as
      { name?: string; value?: unknown } | undefined;
    if (
      (property?.name === "register" || property?.value === "register") &&
      object?.type === "MemberExpression" &&
      (objectProperty?.name === "serviceWorker" ||
        objectProperty?.value === "serviceWorker")
    ) {
      unsupported = "service workers";
    }
  });
  if (unsupported?.startsWith("unmapped executable import:")) {
    throw packageError(
      `Unmapped executable import: ${unsupported.slice("unmapped executable import:".length)}`,
    );
  }
  if (unsupported) {
    throw packageError(
      `The build uses unsupported ${unsupported}: ${scriptRelative}`,
    );
  }
}

function skipCssTrivia(css: string, start: number) {
  let index = start;
  while (index < css.length) {
    if (/[\t\n\f\r ]/.test(css[index])) {
      index += 1;
      continue;
    }
    if (css[index] === "/" && css[index + 1] === "*") {
      const end = css.indexOf("*/", index + 2);
      if (end < 0) return css.length;
      index = end + 2;
      continue;
    }
    break;
  }
  return index;
}

function readCssEscape(css: string, start: number) {
  let index = start + 1;
  if (index >= css.length || /[\n\r\f]/.test(css[index])) return undefined;
  const hex = css.slice(index).match(/^[0-9a-f]{1,6}/i)?.[0];
  if (hex) {
    index += hex.length;
    if (/[\t\n\f\r ]/.test(css[index] ?? "")) index += 1;
    const codePoint = Number.parseInt(hex, 16);
    return {
      value:
        codePoint === 0 ||
        codePoint > 0x10ffff ||
        (codePoint >= 0xd800 && codePoint <= 0xdfff)
          ? "\ufffd"
          : String.fromCodePoint(codePoint),
      end: index,
    };
  }
  return { value: css[index], end: index + 1 };
}

function readCssIdentifier(css: string, start: number) {
  let index = start;
  let value = "";
  while (index < css.length) {
    const character = css[index];
    if (/[-_a-z0-9]/i.test(character) || character.charCodeAt(0) >= 0x80) {
      value += character;
      index += 1;
      continue;
    }
    if (character === "\\") {
      const escape = readCssEscape(css, index);
      if (!escape) break;
      value += escape.value;
      index = escape.end;
      continue;
    }
    break;
  }
  return { value, end: index };
}

function readCssString(css: string, start: number) {
  const quote = css[start];
  let index = start + 1;
  let value = "";
  while (index < css.length) {
    const character = css[index];
    if (character === quote) return { value, end: index + 1, closed: true };
    if (/[\n\r\f]/.test(character)) {
      return { value, end: index + 1, closed: false };
    }
    if (character === "\\") {
      if (/\r|\n|\f/.test(css[index + 1] ?? "")) {
        if (css[index + 1] === "\r" && css[index + 2] === "\n") index += 1;
        index += 2;
        continue;
      }
      const escape = readCssEscape(css, index);
      if (!escape) return { value, end: index + 1, closed: false };
      value += escape.value;
      index = escape.end;
      continue;
    }
    value += character;
    index += 1;
  }
  return { value, end: css.length, closed: false };
}

function readCssImportReference(css: string, start: number) {
  let index = skipCssTrivia(css, start);
  if (css[index] === '"' || css[index] === "'") {
    const string = readCssString(css, index);
    return string.closed ? string.value.trim() : undefined;
  }
  const functionName = readCssIdentifier(css, index);
  if (functionName.value.toLowerCase() !== "url") return undefined;
  index = functionName.end;
  if (css[index] !== "(") return undefined;
  index = skipCssTrivia(css, index + 1);
  if (css[index] === '"' || css[index] === "'") {
    const string = readCssString(css, index);
    if (!string.closed || css[skipCssTrivia(css, string.end)] !== ")")
      return undefined;
    return string.value.trim();
  }
  let value = "";
  while (index < css.length && css[index] !== ")") {
    if (css[index] === "\\") {
      const escape = readCssEscape(css, index);
      if (!escape) return undefined;
      value += escape.value;
      index = escape.end;
      continue;
    }
    if (css[index] === '"' || css[index] === "'") {
      return undefined;
    }
    if (/[\t\n\f\r ]/.test(css[index])) {
      index = skipCssTrivia(css, index);
      return css[index] === ")" ? value.trim() : undefined;
    }
    value += css[index];
    index += 1;
  }
  return css[index] === ")" ? value.trim() : undefined;
}

function skipCssUrl(css: string, start: number) {
  let index = start;
  while (index < css.length) {
    if (css[index] === '"' || css[index] === "'") {
      index = readCssString(css, index).end;
      continue;
    }
    if (css[index] === "\\") {
      index = readCssEscape(css, index)?.end ?? index + 1;
      continue;
    }
    if (css[index] === ")") return index + 1;
    index += 1;
  }
  return css.length;
}

interface CssUrlFunction {
  start: number;
  end: number;
  reference?: string;
}

function readCssUrlFunction(
  css: string,
  start: number,
): CssUrlFunction | undefined {
  const functionName = readCssIdentifier(css, start);
  if (
    functionName.value.toLowerCase() !== "url" ||
    css[functionName.end] !== "("
  ) {
    return undefined;
  }
  let index = skipCssTrivia(css, functionName.end + 1);
  if (css[index] === '"' || css[index] === "'") {
    const string = readCssString(css, index);
    const close = skipCssTrivia(css, string.end);
    if (!string.closed || css[close] !== ")") {
      return {
        start,
        end: skipCssUrl(css, functionName.end + 1),
      };
    }
    return { start, end: close + 1, reference: string.value.trim() };
  }
  let value = "";
  while (index < css.length && css[index] !== ")") {
    if (css[index] === "\\") {
      const escape = readCssEscape(css, index);
      if (!escape) {
        return { start, end: skipCssUrl(css, functionName.end + 1) };
      }
      value += escape.value;
      index = escape.end;
      continue;
    }
    if (css[index] === '"' || css[index] === "'") {
      return { start, end: skipCssUrl(css, functionName.end + 1) };
    }
    if (/[\t\n\f\r ]/.test(css[index])) {
      index = skipCssTrivia(css, index);
      if (css[index] !== ")") {
        return { start, end: skipCssUrl(css, functionName.end + 1) };
      }
      break;
    }
    value += css[index];
    index += 1;
  }
  if (css[index] !== ")") {
    return { start, end: css.length };
  }
  return { start, end: index + 1, reference: value.trim() };
}

function* findCssUrls(css: string): Generator<CssUrlFunction> {
  let index = 0;
  while (index < css.length) {
    if (css[index] === "/" && css[index + 1] === "*") {
      const end = css.indexOf("*/", index + 2);
      index = end < 0 ? css.length : end + 2;
      continue;
    }
    if (css[index] === '"' || css[index] === "'") {
      index = readCssString(css, index).end;
      continue;
    }
    if (/[-_a-z\\]/i.test(css[index])) {
      const url = readCssUrlFunction(css, index);
      if (url) {
        yield url;
        index = Math.max(url.end, index + 1);
      } else {
        const identifier = readCssIdentifier(css, index);
        index = Math.max(identifier.end, index + 1);
      }
      continue;
    }
    index += 1;
  }
}

function* findCssImports(css: string) {
  let index = 0;
  while (index < css.length) {
    if (css[index] === "/" && css[index + 1] === "*") {
      const end = css.indexOf("*/", index + 2);
      index = end < 0 ? css.length : end + 2;
      continue;
    }
    if (css[index] === '"' || css[index] === "'") {
      const string = readCssString(css, index);
      index = string.end;
      continue;
    }
    if (/[-_a-z\\]/i.test(css[index])) {
      const identifier = readCssIdentifier(css, index);
      if (
        identifier.value.toLowerCase() === "url" &&
        css[identifier.end] === "("
      ) {
        index = skipCssUrl(css, identifier.end + 1);
      } else {
        index = Math.max(identifier.end, index + 1);
      }
      continue;
    }
    if (css[index] !== "@") {
      index += 1;
      continue;
    }
    const keyword = readCssIdentifier(css, index + 1);
    index = Math.max(keyword.end, index + 1);
    if (keyword.value.toLowerCase() === "import") {
      yield readCssImportReference(css, keyword.end);
    }
  }
}

async function inlineCssAssets(
  css: string,
  cssRelative: string,
  files: FileMap,
  encodeAsset: AssetEncoder,
  maxJsonBytes: number,
) {
  for (const reference of findCssImports(css)) {
    if (!reference || !/^(?:data:|https?:|\/\/)/i.test(reference)) {
      throw packageError(
        `Unsupported local CSS import in ${cssRelative}${reference ? `: ${reference}` : "."}`,
      );
    }
  }
  const output: string[] = [];
  let outputJsonBytes = 2;
  let cursor = 0;
  let matched = false;
  const append = (part: string) => {
    outputJsonBytes += jsonStringBytes(part) - 2;
    if (outputJsonBytes > maxJsonBytes) {
      throw packageError("Normalized portable payload exceeds 96 MiB.");
    }
    output.push(part);
  };
  for (const url of findCssUrls(css)) {
    matched = true;
    append(css.slice(cursor, url.start));
    const reference = url.reference;
    if (!reference) {
      throw packageError(`Unsupported CSS resource in ${cssRelative}.`);
    }
    if (isEmbeddedOrRemote(reference)) {
      append(css.slice(url.start, url.end));
    } else {
      const relative = resolveFileReference(reference, cssRelative, files);
      if (!relative) {
        throw packageError(
          `Unresolved CSS resource in ${cssRelative}: ${reference}`,
        );
      }
      append(`url("${await encodeAsset(requiredFile(files, relative))}")`);
    }
    cursor = url.end;
  }
  if (!matched) {
    if (jsonStringBytes(css) > maxJsonBytes) {
      throw packageError("Normalized portable payload exceeds 96 MiB.");
    }
    return css;
  }
  append(css.slice(cursor));
  return output.join("");
}

const HTML_RAW_TEXT_ELEMENTS = new Set([
  "iframe",
  "noembed",
  "noframes",
  "script",
  "style",
  "textarea",
  "title",
  "xmp",
]);

function findHtmlRawTextEnd(markup: string, start: number, tagName: string) {
  let candidate = markup.indexOf("</", start);
  while (candidate >= 0) {
    const nameStart = candidate + 2;
    if (
      markup.slice(nameStart, nameStart + tagName.length).toLowerCase() ===
        tagName &&
      /[\t\n\f\r >]/.test(markup[nameStart + tagName.length] ?? "")
    ) {
      return candidate;
    }
    candidate = markup.indexOf("</", candidate + 2);
  }
  return markup.length;
}

function hasHtmlAttribute(markup: string, expectedName: string) {
  let index = 0;
  while (index < markup.length) {
    const tagStart = markup.indexOf("<", index);
    if (tagStart < 0) return false;
    if (markup.startsWith("<!--", tagStart)) {
      const commentEnd = markup.indexOf("-->", tagStart + 4);
      index = commentEnd < 0 ? markup.length : commentEnd + 3;
      continue;
    }
    index = tagStart + 1;
    if (
      markup[index] === "!" ||
      markup[index] === "?" ||
      markup[index] === "/"
    ) {
      const tagEnd = markup.indexOf(">", index + 1);
      index = tagEnd < 0 ? markup.length : tagEnd + 1;
      continue;
    }
    const tagName = markup.slice(index).match(/^[A-Za-z][^\s/>]*/)?.[0];
    if (!tagName) continue;
    index += tagName.length;
    let selfClosing = false;
    while (index < markup.length) {
      while (/[\t\n\f\r ]/.test(markup[index] ?? "")) index += 1;
      if (markup[index] === ">") {
        index += 1;
        break;
      }
      if (markup[index] === "/" && markup[index + 1] === ">") {
        index += 2;
        selfClosing = true;
        break;
      }
      const attributeStart = index;
      while (index < markup.length && !/[\t\n\f\r =/>]/.test(markup[index])) {
        index += 1;
      }
      if (index === attributeStart) {
        index += 1;
        continue;
      }
      const attributeName = markup.slice(attributeStart, index).toLowerCase();
      if (attributeName === expectedName.toLowerCase()) return true;
      while (/[\t\n\f\r ]/.test(markup[index] ?? "")) index += 1;
      if (markup[index] !== "=") continue;
      index += 1;
      while (/[\t\n\f\r ]/.test(markup[index] ?? "")) index += 1;
      if (markup[index] === '"' || markup[index] === "'") {
        const quote = markup[index];
        const valueEnd = markup.indexOf(quote, index + 1);
        index = valueEnd < 0 ? markup.length : valueEnd + 1;
      } else {
        while (index < markup.length && !/[\t\n\f\r >]/.test(markup[index])) {
          index += 1;
        }
      }
    }
    const normalizedTagName = tagName.toLowerCase();
    if (!selfClosing && normalizedTagName === "plaintext") return false;
    if (!selfClosing && HTML_RAW_TEXT_ELEMENTS.has(normalizedTagName)) {
      index = findHtmlRawTextEnd(markup, index, normalizedTagName);
    }
  }
  return false;
}

async function inlineMarkupAssets(
  markup: string,
  htmlRelative: string,
  files: FileMap,
  encodeAsset: AssetEncoder,
  maxJsonBytes: number,
) {
  if (hasHtmlAttribute(markup, "srcset")) {
    throw packageError("Unsupported HTML srcset resource.");
  }
  const result = await replaceAsync(
    markup,
    /\b(src|poster|href|data)\s*=\s*(["'])([^"']+)\2/gi,
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
      return `${attribute}=${quote}${await encodeAsset(requiredFile(files, relative))}${quote}`;
    },
    maxJsonBytes,
  );
  return result;
}

async function inlineJavaScriptAssets(
  source: string,
  scriptRelative: string,
  files: FileMap,
  importMap: ImportMap | undefined,
  encodeAsset: AssetEncoder,
  maxJsonBytes: number,
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
      return `${match[1]}${await encodeAsset(requiredFile(files, relative))}${match[1]}`;
    },
    maxJsonBytes,
  );

  await validateJavaScriptGraph(result, scriptRelative, importMap);
  if (/\.wasm(?:[?"'])/i.test(result)) {
    throw packageError(
      `The build uses unsupported runtime-loaded WASM: ${scriptRelative}`,
    );
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

  const { files } = await inventoryPackFiles(inputDirectory);
  const encodedAssets = new Map<PackFile, Promise<string>>();
  const encodeAsset: AssetEncoder = (file) => {
    const existing = encodedAssets.get(file);
    if (existing) return existing;
    const encoded = asDataUrl(file);
    encodedAssets.set(file, encoded);
    return encoded;
  };
  const htmlFile = files.get("index.html");
  if (!htmlFile) {
    throw packageError(
      `Pack input does not contain a readable index.html: ${inputDirectory}`,
    );
  }

  let html: string;
  try {
    html = (await readPackFile(htmlFile)).toString("utf8");
  } catch (error) {
    throw packageError(
      `Could not read pack input HTML: ${htmlFile.absolute}`,
      error,
    );
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
  const titleMatch = cleanedHtml.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i);
  const title = titleMatch?.[1].trim() || "Rtifact";
  const scriptType = getAttribute(scriptTag, "type") || "module";
  const styles: string[] = [];
  let normalizedBytes = estimatedJsonBytes({
    version: SINGLE_FILE_PAYLOAD_VERSION,
    title,
    head: "",
    body: "",
    styles,
    ...(importMap ? { importMap } : {}),
    scriptType,
    script: "",
  });
  const remainingFieldBytes = () =>
    PACK_INPUT_LIMITS.normalizedBytes - normalizedBytes + 2;
  const commitField = (value: string) => {
    normalizedBytes += jsonStringBytes(value) - 2;
  };
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
    const css = (await readPackFile(requiredFile(files, cssRelative))).toString(
      "utf8",
    );
    const separatorBytes = styles.length === 0 ? 0 : 1;
    const style = await inlineCssAssets(
      css,
      cssRelative,
      files,
      encodeAsset,
      PACK_INPUT_LIMITS.normalizedBytes - normalizedBytes - separatorBytes,
    );
    normalizedBytes += separatorBytes + jsonStringBytes(style);
    styles.push(style);
    cleanedHtml = cleanedHtml.replace(tag, "");
  }

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
  head = await inlineMarkupAssets(
    head,
    "index.html",
    files,
    encodeAsset,
    remainingFieldBytes(),
  );
  commitField(head);
  body = await inlineMarkupAssets(
    body,
    "index.html",
    files,
    encodeAsset,
    remainingFieldBytes(),
  );
  commitField(body);

  let script = (
    await readPackFile(requiredFile(files, scriptRelative))
  ).toString("utf8");
  script = await inlineJavaScriptAssets(
    script,
    scriptRelative,
    files,
    importMap,
    encodeAsset,
    remainingFieldBytes(),
  );
  commitField(script);

  return {
    version: SINGLE_FILE_PAYLOAD_VERSION,
    title,
    head,
    body,
    styles,
    ...(importMap ? { importMap } : {}),
    scriptType,
    script,
  };
}

function jsonStringBytes(value: string) {
  let bytes = 2;
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code === 0x22 || code === 0x5c) {
      bytes += 2;
    } else if (code <= 0x1f) {
      bytes +=
        code === 0x08 ||
        code === 0x09 ||
        code === 0x0a ||
        code === 0x0c ||
        code === 0x0d
          ? 2
          : 6;
    } else if (code <= 0x7f) {
      bytes += 1;
    } else if (code <= 0x7ff) {
      bytes += 2;
    } else if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        bytes += 4;
        index += 1;
      } else {
        bytes += 6;
      }
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      bytes += 6;
    } else {
      bytes += 3;
    }
  }
  return bytes;
}

function estimatedJsonBytes(value: unknown): number {
  if (typeof value === "string") return jsonStringBytes(value);
  if (typeof value === "number")
    return Number.isFinite(value) ? Buffer.byteLength(String(value)) : 4;
  if (typeof value === "boolean") return value ? 4 : 5;
  if (value === null) return 4;
  if (Array.isArray(value)) {
    const items: unknown[] = value;
    return (
      2 +
      Math.max(0, items.length - 1) +
      items.reduce<number>((bytes, item) => bytes + estimatedJsonBytes(item), 0)
    );
  }
  if (typeof value === "object") {
    const entries = Object.entries(value);
    return (
      2 +
      Math.max(0, entries.length - 1) +
      entries.reduce(
        (bytes, [key, item]) =>
          bytes + jsonStringBytes(key) + 1 + estimatedJsonBytes(item),
        0,
      )
    );
  }
  throw packageError("Portable payload contains a non-JSON value.");
}

export async function createSingleFileArtifact(inputDirectory: string) {
  const payload = await normalizeBuildDirectory(inputDirectory);
  if (estimatedJsonBytes(payload) > PACK_INPUT_LIMITS.normalizedBytes) {
    throw packageError("Normalized portable payload exceeds 96 MiB.");
  }
  const serialized = JSON.stringify(payload);
  const serializedBytes = Buffer.byteLength(serialized);
  if (serializedBytes > PACK_INPUT_LIMITS.normalizedBytes) {
    throw packageError("Normalized portable payload exceeds 96 MiB.");
  }
  const compressed = gzipSync(Buffer.from(serialized, "utf8"), { level: 9 });
  const html = createSingleFileHtml(
    compressed.toString("base64"),
    SINGLE_FILE_PAYLOAD_VERSION,
  );
  const bytes = Buffer.byteLength(html);
  if (bytes > PACK_INPUT_LIMITS.artifactBytes) {
    throw packageError("Portable HTML artifact exceeds 128 MiB.");
  }
  return {
    html,
    bytes,
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
