import assert from "node:assert/strict";
import { PassThrough } from "node:stream";
import test from "node:test";
import { confirmReplacement } from "../../src/confirmation.js";

function interactiveInput(contents: string) {
  const input = Object.assign(new PassThrough(), { isTTY: true });
  input.end(contents);
  return input;
}

function outputSink() {
  let contents = "";
  return {
    output: {
      write(chunk: unknown) {
        contents += String(chunk);
        return true;
      },
    },
    read: () => contents,
  };
}

test("accepts yes and repeats invalid answers", async () => {
  const sink = outputSink();
  assert.equal(
    await confirmReplacement("/tmp/output", {
      input: interactiveInput("maybe\nYES\n"),
      output: sink.output,
    }),
    true,
  );
  assert.match(sink.read(), /Replace it\? \(yes\/no\):/);
  assert.match(sink.read(), /Please type yes or no/);
});

test("accepts no without mutation authorization", async () => {
  assert.equal(
    await confirmReplacement("/tmp/output", {
      input: interactiveInput("no\n"),
      output: outputSink().output,
    }),
    false,
  );
});

test("refuses non-interactive input and incomplete confirmation", async () => {
  const nonInteractive = Object.assign(new PassThrough(), { isTTY: false });
  await assert.rejects(
    confirmReplacement("/tmp/output", {
      input: nonInteractive,
      output: outputSink().output,
    }),
    /non-interactive.*--force/s,
  );
  await assert.rejects(
    confirmReplacement("/tmp/output", {
      input: interactiveInput(""),
      output: outputSink().output,
    }),
    /before yes or no/,
  );
});
