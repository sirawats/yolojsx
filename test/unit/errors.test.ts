import assert from "node:assert/strict";
import test from "node:test";
import { formatError, sanitizeDiagnostic } from "../../src/errors.js";

test("formats source locations without disclosing code frames", () => {
  const cause = Object.assign(
    new Error(
      "[PARSE_ERROR] Unexpected token\n2 | const password = 'RTIFACT_SECRET_MESSAGE_MARKER';\n  |       ^",
    ),
    {
      loc: { file: "/tmp/Secret.jsx", line: 2, column: 7 },
      frame: "2 | const password = 'RTIFACT_SECRET_FRAME_MARKER';\n  |       ^",
    },
  );
  const error = Object.assign(new Error("Build failed for /tmp/Secret.jsx"), {
    id: "/tmp/Secret.jsx",
    cause,
  });

  const formatted = formatError(error);
  assert.match(formatted, /PARSE_ERROR/);
  assert.match(formatted, /Secret\.jsx/);
  assert.match(formatted, /2:7/);
  assert.doesNotMatch(
    formatted,
    /RTIFACT_SECRET_(?:MESSAGE|FRAME)_MARKER|password/,
  );
});

test("bounds diagnostics without splitting multibyte text", () => {
  const diagnostic = sanitizeDiagnostic("🙂".repeat(100), 64);
  assert.ok(Buffer.byteLength(diagnostic) <= 64);
  assert.match(diagnostic, /truncated/);
  assert.doesNotMatch(diagnostic, /�/);
});
