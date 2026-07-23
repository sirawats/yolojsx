import path from "node:path";
import { createThemeRuntime } from "./theme-css.js";

export const VIRTUAL_ENTRY_ID = "virtual:yolojsx-entry";
export const RESOLVED_VIRTUAL_ENTRY_ID = `\0${VIRTUAL_ENTRY_ID}`;

function toCssPath(value) {
  return value.replaceAll(path.sep, "/").replaceAll('"', '\\"');
}

export function createHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>yolo-jsx</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.jsx"></script>
  </body>
</html>
`;
}

export function createMainModule() {
  return `import "./styles.css";
import "${VIRTUAL_ENTRY_ID}";
`;
}

export function createTailwindStyles(
  workspace,
  sourceDirectory,
  tailwindStylesheet,
  themeStylesheet,
  customStylesheet,
) {
  const source = toCssPath(path.relative(workspace, sourceDirectory) || ".");
  const stylesheet = toCssPath(tailwindStylesheet);
  const themeImport = toCssPath(themeStylesheet);
  const customImport = customStylesheet
    ? `@import "${toCssPath(customStylesheet)}";\n`
    : "";
  return `/* Stable package-owned cascade for Tailwind, Ant Design, and user CSS. */
@layer theme, base, antd, components, utilities;
@import "${stylesheet}" source(none);
@import "${themeImport}";
${customImport}@source "${source}";
`;
}

export function createEntryPlugin(entry, selectedTheme) {
  const runtime = createThemeRuntime(selectedTheme);
  return {
    name: "yolojsx-entry",
    resolveId(source) {
      if (source === VIRTUAL_ENTRY_ID) {
        return RESOLVED_VIRTUAL_ENTRY_ID;
      }
      return null;
    },
    load(id) {
      if (id !== RESOLVED_VIRTUAL_ENTRY_ID) {
        return null;
      }

      return `import React from "react";
import { createRoot } from "react-dom/client";
import { StyleProvider } from "@ant-design/cssinjs";
import { ConfigProvider, theme as antdTheme } from "antd";
import EntryComponent from ${JSON.stringify(entry)};

const themeRuntime = ${JSON.stringify(runtime)};

function YoloJsxThemeBoundary() {
  const selected = themeRuntime.config;
  const algorithm = selected.algorithm === "dark"
    ? antdTheme.darkAlgorithm
    : antdTheme.defaultAlgorithm;
  const theme = {
    algorithm,
    cssVar: true,
    token: selected.tokens,
  };

  return React.createElement(
    StyleProvider,
    { layer: true },
    React.createElement(
      ConfigProvider,
      { theme },
      React.createElement(EntryComponent),
    ),
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("yolo-jsx could not find the generated #root element.");
}

const componentType = typeof EntryComponent;
if (componentType !== "function" && componentType !== "object") {
  throw new TypeError("The JSX entry must default-export a React component.");
}

createRoot(rootElement).render(React.createElement(YoloJsxThemeBoundary));
`;
    },
  };
}

export function createSingleFileHtml(encodedPayload, payloadVersion) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Loading yolo-jsx application…</title>
  </head>
  <body>
    <main id="yolojsx-status" style="font:16px/1.5 system-ui,sans-serif;padding:2rem">Loading application…</main>
    <script id="yolojsx-payload" type="application/octet-stream">${encodedPayload}</script>
    <script>
      (() => {
        const showError = (error) => {
          const message = error instanceof Error ? error.message : String(error);
          document.body.replaceChildren();
          const output = document.createElement("pre");
          output.style.cssText = "white-space:pre-wrap;font:16px/1.5 system-ui,sans-serif;padding:2rem;color:#991b1b";
          output.textContent = "Unable to load this yolo-jsx application.\\n" + message;
          document.body.append(output);
        };

        const start = async () => {
          if (typeof DecompressionStream !== "function") {
            throw new Error("This browser does not support native gzip decompression (DecompressionStream).");
          }

          const encoded = document.getElementById("yolojsx-payload").textContent.trim();
          const chunks = [];
          const chunkSize = 32768;
          for (let offset = 0; offset < encoded.length; offset += chunkSize) {
            const binary = atob(encoded.slice(offset, offset + chunkSize));
            const bytes = new Uint8Array(binary.length);
            for (let index = 0; index < binary.length; index += 1) {
              bytes[index] = binary.charCodeAt(index);
            }
            chunks.push(bytes);
          }

          const compressed = new Blob(chunks).stream();
          const decompressed = compressed.pipeThrough(new DecompressionStream("gzip"));
          const payload = JSON.parse(await new Response(decompressed).text());
          if (payload.version !== ${JSON.stringify(payloadVersion)}) {
            throw new Error("Unsupported packaged application version: " + payload.version);
          }

          document.title = payload.title || "yolo-jsx";
          if (payload.head) {
            document.head.insertAdjacentHTML("beforeend", payload.head);
          }
          for (const css of payload.styles) {
            const style = document.createElement("style");
            style.textContent = css;
            document.head.append(style);
          }
          document.body.innerHTML = payload.body;
          const script = document.createElement("script");
          script.type = payload.scriptType;
          script.textContent = payload.script;
          document.body.append(script);
        };

        start().catch(showError);
      })();
    </script>
  </body>
</html>
`;
}
