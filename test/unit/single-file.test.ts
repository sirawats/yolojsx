import assert from "node:assert/strict";
import {
  chmod,
  link,
  mkdir,
  rename,
  rm,
  symlink,
  truncate,
  writeFile,
} from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { gzipSync } from "node:zlib";
import { SINGLE_FILE_PAYLOAD_VERSION } from "../../src/constants.js";
import { hasErrorCode } from "../../src/errors.js";
import { createCdnImportMap } from "../../src/dependencies.js";
import {
  createSingleFileArtifact,
  inventoryPackFiles,
  normalizeBuildDirectory,
  readPackFile,
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

test("rejects dynamic imports regardless of expression position", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "index.html": `<!doctype html><html><head></head><body><script type="module" src="app.js"></script></body></html>`,
    "app.js": `const lazy = import("https://example.com/remote.js");`,
  });

  await assert.rejects(
    normalizeBuildDirectory(fixture),
    /unsupported additional JavaScript imports/,
  );
});

test("rejects an oversized pack input before reading or encoding it", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "index.html": `<!doctype html><html><head></head><body><img src="large.png"><script type="module" src="app.js"></script></body></html>`,
    "app.js": `document.body.dataset.ready="yes";`,
    "large.png": "",
  });
  await truncate(`${fixture}/large.png`, 16 * 1024 * 1024 + 1);

  await assert.rejects(
    normalizeBuildDirectory(fixture),
    /pack input file exceeds 16 MiB.*large\.png/i,
  );
});

test("binds pack reads and accounting to inventoried physical files", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, { "asset.bin": "original" });
  await link(`${fixture}/asset.bin`, `${fixture}/alias.bin`);

  const inventory = await inventoryPackFiles(fixture);
  assert.equal(inventory.physicalBytes, Buffer.byteLength("original"));
  assert.equal(inventory.files.size, 2);

  await writeFile(`${fixture}/replacement.bin`, "replaced");
  await rename(`${fixture}/replacement.bin`, `${fixture}/asset.bin`);
  await assert.rejects(
    readPackFile(inventory.files.get("asset.bin")!),
    /changed after inventory/,
  );
});

test("rejects inventoried pack files that grow, shrink, disappear, or change type", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const file = `${fixture}/asset.bin`;

  const expectMutationRejected = async (
    mutate: () => Promise<unknown>,
    expected: RegExp,
  ) => {
    await rm(file, { recursive: true, force: true });
    await writeFile(file, "original");
    const record = (await inventoryPackFiles(fixture)).files.get("asset.bin")!;
    await mutate();
    await assert.rejects(readPackFile(record), expected);
  };

  await expectMutationRejected(
    () => writeFile(file, "original-grown"),
    /changed/,
  );
  await expectMutationRejected(() => writeFile(file, "short"), /changed/);
  await expectMutationRejected(() => rm(file), /disappeared after inventory/);
  await expectMutationRejected(async () => {
    await rm(file);
    await mkdir(file);
  }, /not a regular non-symbolic-link file/);
  await expectMutationRejected(async () => {
    await rm(file);
    try {
      await symlink(`${fixture}/target.bin`, file);
    } catch (error: unknown) {
      if (
        process.platform === "win32" &&
        (hasErrorCode(error, "EPERM") || hasErrorCode(error, "EACCES"))
      ) {
        const targetDir = `${fixture}/target-dir`;
        await mkdir(targetDir, { recursive: true });
        await symlink(targetDir, file, "junction");
      } else {
        throw error;
      }
    }
  }, /not a regular non-symbolic-link file/);
});

test("rejects changed inventoried files before they can exceed the aggregate budget", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(
    fixture,
    Object.fromEntries(
      Array.from({ length: 5 }, (_, index) => [`asset-${index}.bin`, "x"]),
    ),
  );
  const inventory = await inventoryPackFiles(fixture);

  for (let index = 0; index < 5; index += 1) {
    const replacement = `${fixture}/replacement-${index}.bin`;
    await writeFile(replacement, "");
    await truncate(replacement, 15 * 1024 * 1024);
    await rename(replacement, `${fixture}/asset-${index}.bin`);
  }

  for (const record of inventory.files.values()) {
    await assert.rejects(readPackFile(record), /changed after inventory/);
  }
});

test("reports an inventoried pack file that becomes unreadable", async (t) => {
  if (process.platform === "win32" || process.getuid?.() === 0) {
    t.skip("POSIX permission behavior requires an unprivileged process");
    return;
  }
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const file = `${fixture}/asset.bin`;
  await writeFile(file, "asset");
  const record = (await inventoryPackFiles(fixture)).files.get("asset.bin")!;
  await chmod(file, 0);
  await assert.rejects(readPackFile(record), /Pack input is not readable/);
});

test("rejects repeated asset expansion while normalizing", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const repeatedImages = Array.from(
    { length: 80 },
    () => `<img src="large.png">`,
  ).join("");
  await writeFixture(fixture, {
    "index.html": `<!doctype html><html><head></head><body>${repeatedImages}<script type="module" src="app.js"></script></body></html>`,
    "app.js": `document.body.dataset.ready="yes";`,
    "large.png": "",
  });
  await truncate(`${fixture}/large.png`, 1024 * 1024);

  await assert.rejects(
    normalizeBuildDirectory(fixture),
    /Normalized portable payload exceeds 96 MiB/,
  );
});

test("rejects unsupported local CSS imports and HTML srcset", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "index.html": `<!doctype html><html><head><link rel="stylesheet" href="app.css"></head><body><img srcset="small.png 1x, large.png 2x"><script type="module" src="app.js"></script></body></html>`,
    "app.css": `@import "theme.css";`,
    "app.js": `document.body.dataset.ready="yes";`,
    "theme.css": `body{color:red}`,
    "small.png": "small",
    "large.png": "large",
  });
  await assert.rejects(normalizeBuildDirectory(fixture), /local CSS import/);

  await writeFixture(fixture, {
    "index.html": `<!doctype html><html><head><link rel="stylesheet" href="app.css"></head><body><script type="module" src="app.js"></script></body></html>`,
    "app.css": `@IMPORT url( theme.css );`,
    "theme.css": `.icon{background:url(icon.png)}`,
    "icon.png": "icon",
  });
  await assert.rejects(normalizeBuildDirectory(fixture), /local CSS import/);

  await writeFixture(fixture, {
    "app.css": String.raw`@\69mport "theme.css";`,
  });
  await assert.rejects(normalizeBuildDirectory(fixture), /local CSS import/);

  await writeFixture(fixture, { "app.css": `@import url(` });
  await assert.rejects(normalizeBuildDirectory(fixture), /local CSS import/);

  await writeFixture(fixture, {
    "index.html": `<!doctype html><html><head><link rel="stylesheet" href="app.css"></head><body><img srcset="small.png 1x, large.png 2x"><script type="module" src="app.js"></script></body></html>`,
    "app.css": `body{color:red}`,
  });
  await assert.rejects(normalizeBuildDirectory(fixture), /HTML srcset/);

  await writeFixture(fixture, {
    "index.html": `<!doctype html><html><head></head><body><img srcset="https://example.com/image.png 1x"><script type="module" src="app.js"></script></body></html>`,
  });
  await assert.rejects(normalizeBuildDirectory(fixture), /HTML srcset/);

  await writeFixture(fixture, {
    "index.html": `<!doctype html><html><head></head><body><img SrCsEt=https://example.com/image.png><script type="module" src="app.js"></script></body></html>`,
  });
  await assert.rejects(normalizeBuildDirectory(fixture), /HTML srcset/);
});

test("inlines assets referenced by escaped CSS url functions", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "index.html": `<!doctype html><html><head><link rel="stylesheet" href="app.css"></head><body><script type="module" src="app.js"></script></body></html>`,
    "app.css": String.raw`.icon{background:u\72l(icon.png)}`,
    "app.js": `document.body.dataset.ready="yes";`,
    "icon.png": "icon",
  });

  const payload = await normalizeBuildDirectory(fixture);
  assert.match(payload.styles[0], /url\("data:image\/png;base64,/);
  assert.doesNotMatch(payload.styles[0], /icon\.png/);
});

test("ignores harmless CSS import and HTML srcset text", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await writeFixture(fixture, {
    "index.html": `<!doctype html><html><head><link rel="stylesheet" href="app.css"></head><body><!-- srcset="ignored.png 1x" --><p>srcset= is documentation</p><img data-srcset="ignored.png 1x"><script type="module" src="app.js"></script></body></html>`,
    "app.css": `/* @import "ignored.css"; */ body::before{content:"@import 'ignored.css'"}@import url("https://example.com/remote.css") screen;@import "data:text/css,body%7Bcolor:red%7D";`,
    "app.js": `document.body.dataset.ready="yes";`,
  });

  const payload = await normalizeBuildDirectory(fixture);
  assert.match(payload.body, /data-srcset/);
  assert.match(payload.styles[0], /example\.com\/remote\.css/);

  await writeFixture(fixture, {
    "index.html": `<!doctype html><html><head><link rel="stylesheet" href="app.css"></head><body><textarea><img srcset="literal.png 1x"></textarea><script type="module" src="app.js"></script></body></html>`,
    "app.css": `.icon{background:url(foo@import)}`,
    "foo@import": "asset",
  });
  const rawTextPayload = await normalizeBuildDirectory(fixture);
  assert.match(rawTextPayload.body, /textarea/);
  assert.match(rawTextPayload.styles[0], /data:application\/octet-stream/);

  await writeFixture(fixture, {
    "app.css": `body::before{content:"broken\n}@import "ignored.css";`,
  });
  await assert.rejects(normalizeBuildDirectory(fixture), /local CSS import/);
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

  await writeFixture(fixture, { "app.js": `new Worker(runtime.filename);` });
  await assert.rejects(normalizeBuildDirectory(fixture), /web workers/);

  await writeFixture(fixture, {
    "app.js": `new Worker(runtime.filename).onmessage = function(){runtime.postMessage(JSON.stringify({immediateClose:true}))};`,
  });
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
  html: string,
  {
    decompression = true,
    importMaps = true,
    moduleError = false,
  }: {
    decompression?: boolean;
    importMaps?: boolean;
    moduleError?: boolean;
  } = {},
) {
  interface FakeElement {
    name?: string;
    style?: Record<string, string>;
    textContent: string;
    type: string;
    onerror?: () => void;
    onload?: () => void;
  }

  const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)];
  const encoded = scripts[0][1];
  let finish!: () => void;
  let timeout!: ReturnType<typeof setTimeout>;
  const finished = new Promise<void>((resolve, reject) => {
    finish = resolve;
    timeout = setTimeout(
      () => reject(new Error("Bootstrap did not finish.")),
      5000,
    );
  });
  const body = {
    innerHTML: "",
    children: [] as FakeElement[],
    replaceChildren() {
      this.children = [];
      this.innerHTML = "";
    },
    append(child: FakeElement) {
      this.children.push(child);
      if (child.type === "module") {
        setImmediate(() => {
          if (moduleError) {
            child.onerror?.();
          } else {
            child.onload?.();
            finish();
          }
        });
      } else {
        finish();
      }
    },
  };
  const head = {
    children: [] as FakeElement[],
    html: "",
    replaceChildren() {
      this.children = [];
      this.html = "";
    },
    insertAdjacentHTML(_position: string, value: string) {
      this.html = value;
    },
    append(child: FakeElement) {
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
    createElement(name: string): FakeElement {
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
            static supports(type: string) {
              return type === "importmap";
            }
          },
        }
      : {}),
  };
  vm.runInNewContext(scripts[1][1], context);
  try {
    await finished;
  } finally {
    clearTimeout(timeout);
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

  const invalidPayload = {
    ...payload,
    title: "Must not be restored",
    head: "<meta name=must-not-be-restored>",
    styles: "not-an-array",
  };
  const invalidEncoded = gzipSync(
    Buffer.from(JSON.stringify(invalidPayload)),
  ).toString("base64");
  const invalid = await runBootstrap(
    createSingleFileHtml(invalidEncoded, SINGLE_FILE_PAYLOAD_VERSION),
  );
  assert.match(invalid.body.children[0].textContent, /Invalid packaged/);
  assert.notEqual(invalid.document.title, invalidPayload.title);
  assert.equal(invalid.head.html, "");
  assert.equal(invalid.head.children.length, 0);
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
  assert.notEqual(failed.document.title, payload.title);
  assert.equal(failed.head.html, "");
  assert.equal(failed.head.children.length, 0);
});
