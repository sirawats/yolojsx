import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { gzipSync } from "node:zlib";
import { SINGLE_FILE_PAYLOAD_VERSION } from "../../src/constants.js";
import { createCdnImportMap } from "../../src/dependencies.js";
import {
  createSingleFileArtifact,
  normalizeBuildDirectory,
  readEmbeddedPayload,
} from "../../src/single-file.js";
import { createSingleFileHtml } from "../../src/templates.js";
import { makeFixture, writeFixture } from "../helpers.js";

test("normalizes assets and round-trips a compressed HTML artifact", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "index.html": `<!doctype html><html><head><title>Fixture</title><link rel="stylesheet" href="./assets/app.css"></head><body><div id="root"><img src="./assets/logo.png"></div><script type="module" src="./assets/app.js"></script></body></html>`,
    "assets/app.css": `.hero{background:url("./logo.png")}`,
    "assets/app.js": `const logo="./logo.png";document.querySelector("#root").dataset.logo=logo;`,
    "assets/logo.png": "not-a-real-png-but-binary-safe",
  });

  const payload = await normalizeBuildDirectory(fixture);
  assert.equal(payload.version, SINGLE_FILE_PAYLOAD_VERSION);
  assert.equal(payload.title, "Fixture");
  assert.match(payload.body, /src="data:image\/png;base64,/);
  assert.match(payload.styles[0], /url\("data:image\/png;base64,/);
  assert.match(payload.script, /data:image\/png;base64,/);

  const artifact = await createSingleFileArtifact(fixture);
  assert.ok(artifact.compressedBytes < JSON.stringify(payload).length);
  assert.doesNotMatch(artifact.html, /not-a-real-png/);
  assert.match(artifact.html, /DecompressionStream\("gzip"\)/);
  assert.match(artifact.html, /start\(\)\.catch\(showError\)/);
  assert.deepEqual(readEmbeddedPayload(artifact.html), payload);
});

test("keeps payload source unable to terminate the outer script", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "index.html": `<!doctype html><html><head><title>Safe</title></head><body><div id="root"></div><script type="module" src="app.js"></script></body></html>`,
    "app.js": `document.body.dataset.value = "</script><script>bad()</script>";`,
  });
  const artifact = await createSingleFileArtifact(fixture);
  assert.equal((artifact.html.match(/<script\b/g) ?? []).length, 2);
  assert.match(readEmbeddedPayload(artifact.html).script, /bad\(\)/);
});

test("does not mistake application scopes for resource URL schemes", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "index.html": `<!doctype html><html><head></head><body><script type="module" src="app.js"></script></body></html>`,
    "app.js": `const scopes=["events:read","tokens:write"];document.body.dataset.scopes=scopes.join(",");`,
  });

  const payload = await normalizeBuildDirectory(fixture);
  assert.match(payload.script, /events:read/);
  assert.match(payload.script, /tokens:write/);
});

test("normalizes only the controlled CDN import map", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const importMap = createCdnImportMap();
  await writeFixture(fixture, {
    "index.html": `<!doctype html><html><head><script type="importmap">${JSON.stringify(importMap)}</script></head><body><script type="module" src="app.js"></script></body></html>`,
    "app.js": `import React from "react";document.body.dataset.react=String(React);`,
  });

  const payload = await normalizeBuildDirectory(fixture);
  assert.deepEqual(payload.importMap, importMap);

  await writeFixture(fixture, {
    "app.js": `import value from "unmapped";document.body.dataset.value=value;`,
  });
  await assert.rejects(normalizeBuildDirectory(fixture), /Unmapped.*unmapped/);

  await writeFixture(fixture, {
    "index.html": `<!doctype html><html><head><script type="importmap">{"imports":{"react":"https://example.com/react.js"}}</script></head><body><script type="module" src="app.js"></script></body></html>`,
  });
  await assert.rejects(normalizeBuildDirectory(fixture), /controlled CDN/);
});

test("rejects incompatible build resource shapes", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));

  await assert.rejects(normalizeBuildDirectory(fixture), /index\.html/);

  await writeFixture(fixture, {
    "index.html": `<!doctype html><html><head></head><body><script type="module" src="app.js"></script></body></html>`,
    "app.js": `fetch("./runtime.json");`,
  });
  await assert.rejects(
    normalizeBuildDirectory(fixture),
    /runtime-relative fetches/,
  );

  await writeFixture(fixture, { "extra.js": "export default 1;" });
  await assert.rejects(normalizeBuildDirectory(fixture), /found 2/);
});

test("rejects CSS root escapes, workers, and non-local entries", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "index.html": `<!doctype html><html><head><link rel="stylesheet" href="app.css"></head><body><script src="app.js"></script></body></html>`,
    "app.css": `body{background:url("../outside.png")}`,
    "app.js": `new Worker("worker.js");`,
  });
  await assert.rejects(
    normalizeBuildDirectory(fixture),
    /escapes the pack input/,
  );

  await writeFixture(fixture, { "app.css": "body{color:red}" });
  await assert.rejects(normalizeBuildDirectory(fixture), /web workers/);

  await writeFixture(fixture, { "app.js": `new Worker(workerUrl);` });
  await assert.rejects(normalizeBuildDirectory(fixture), /web workers/);

  await writeFixture(fixture, {
    "index.html": `<!doctype html><html><head></head><body><script src="https://example.com/app.js"></script></body></html>`,
  });
  await assert.rejects(
    normalizeBuildDirectory(fixture),
    /not a local JavaScript/,
  );
});

async function runBootstrap(
  html,
  { decompression = true, importMaps = true, moduleError = false } = {},
) {
  const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)];
  const encoded = scripts[0][1];
  const body = {
    innerHTML: "",
    children: [],
    replaceChildren() {
      this.children = [];
      this.innerHTML = "";
    },
    append(child) {
      this.children.push(child);
      if (child.type === "module") {
        setImmediate(() =>
          moduleError ? child.onerror?.() : child.onload?.(),
        );
      }
    },
  };
  const head = {
    children: [],
    insertAdjacentHTML(_position, value) {
      this.html = value;
    },
    append(child) {
      this.children.push(child);
    },
  };
  const document = {
    body,
    head,
    title: "",
    getElementById() {
      return { textContent: encoded };
    },
    createElement(name) {
      return { name, style: {}, textContent: "", type: "" };
    },
  };
  const context = {
    atob,
    Blob,
    document,
    Response,
    Uint8Array,
    ...(decompression ? { DecompressionStream } : {}),
    ...(importMaps
      ? {
          HTMLScriptElement: class {
            static supports(type) {
              return type === "importmap";
            }
          },
        }
      : {}),
  };
  vm.runInNewContext(scripts[1][1], context);
  for (let index = 0; index < 10; index += 1) {
    await new Promise((resolve) => setImmediate(resolve));
  }
  return { body, document, head };
}

test("bootstrap restores supported payloads and renders failure messages", async () => {
  const payload = {
    version: SINGLE_FILE_PAYLOAD_VERSION,
    title: "Restored",
    head: "<meta name=fixture content=yes>",
    body: '<div id="root"></div>',
    styles: ["body{color:red}"],
    scriptType: "module",
    script: "document.body.dataset.ready='yes'",
  };
  const encoded = gzipSync(Buffer.from(JSON.stringify(payload))).toString(
    "base64",
  );
  const restored = await runBootstrap(
    createSingleFileHtml(encoded, SINGLE_FILE_PAYLOAD_VERSION),
  );
  assert.equal(restored.document.title, "Restored");
  assert.equal(restored.body.innerHTML, payload.body);
  assert.equal(restored.head.children[0].textContent, payload.styles[0]);
  assert.equal(restored.body.children[0].textContent, payload.script);

  const unsupportedBrowser = await runBootstrap(
    createSingleFileHtml(encoded, SINGLE_FILE_PAYLOAD_VERSION),
    {
      decompression: false,
    },
  );
  assert.match(
    unsupportedBrowser.body.children[0].textContent,
    /does not support/,
  );

  const wrongVersion = await runBootstrap(
    createSingleFileHtml(encoded, SINGLE_FILE_PAYLOAD_VERSION + 1),
  );
  assert.match(
    wrongVersion.body.children[0].textContent,
    /Unsupported packaged/,
  );

  const corrupt = await runBootstrap(
    createSingleFileHtml("not-base64", SINGLE_FILE_PAYLOAD_VERSION),
  );
  assert.match(corrupt.body.children[0].textContent, /Unable to load/);
});

test("bootstrap installs import maps and reports CDN failures", async () => {
  const payload = {
    version: SINGLE_FILE_PAYLOAD_VERSION,
    title: "CDN",
    head: "",
    body: '<div id="root"></div>',
    styles: [],
    importMap: createCdnImportMap(),
    scriptType: "module",
    script: `import React from "react";`,
  };
  const encoded = gzipSync(Buffer.from(JSON.stringify(payload))).toString(
    "base64",
  );
  const html = createSingleFileHtml(encoded, SINGLE_FILE_PAYLOAD_VERSION);
  const restored = await runBootstrap(html);
  assert.equal(restored.head.children[0].type, "importmap");
  assert.deepEqual(
    JSON.parse(restored.head.children[0].textContent),
    payload.importMap,
  );

  const unsupported = await runBootstrap(html, { importMaps: false });
  assert.match(unsupported.body.children[0].textContent, /import maps/);

  const failed = await runBootstrap(html, { moduleError: true });
  assert.match(failed.body.children[0].textContent, /application runtime/);
});
