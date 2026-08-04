import assert from "node:assert/strict";
import {
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { hasErrorCode } from "../../src/errors.js";
import {
  cleanupDirectory,
  commitFileOutput,
  commitOutput,
  inspectFileOutput,
  inspectOutput,
  publishPreparedDirectory,
  publishPreparedFile,
} from "../../src/output.js";
import { makeFixture, writeFixture } from "../helpers.js";

test("reports cleanup failures without replacing the original failure", async () => {
  const failure = new Error("Original build failure.");

  await cleanupDirectory("\0", failure);

  assert.match(failure.message, /^Original build failure\./);
  assert.match(failure.message, /Cleanup also failed:/);
});

test("throws cleanup failures when there is no earlier failure", async () => {
  await assert.rejects(cleanupDirectory("\0"));
});

test("restores an authorized directory when stage publication fails", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const output = path.join(fixture, "dist");
  await writeFixture(output, { "important.txt": "last good output" });
  const state = await inspectOutput(output, true);

  await assert.rejects(
    commitOutput(
      path.join(fixture, "missing-stage"),
      output,
      state.authorization,
    ),
    /ENOENT/,
  );
  assert.equal(
    await readFile(path.join(output, "important.txt"), "utf8"),
    "last good output",
  );
});

test("preserves a recognizable backup and the primary error when recovery fails", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const output = path.join(fixture, "dist");
  const stage = path.join(fixture, "stage");
  await writeFixture(output, { "important.txt": "last good output" });
  await writeFixture(stage, { "index.html": "new output" });
  const state = await inspectOutput(output, true);
  let renameCount = 0;

  await assert.rejects(
    commitOutput(stage, output, state.authorization, {
      async rename(from, to) {
        renameCount += 1;
        if (renameCount === 1) return rename(from, to);
        if (renameCount === 2) throw new Error("primary publication failure");
        throw new Error("simulated recovery failure");
      },
      rm,
    }),
    (error: Error) => {
      assert.match(error.message, /^primary publication failure/);
      assert.match(error.message, /Backup recovery also failed/);
      assert.match(error.message, /Recoverable backup:/);
      return true;
    },
  );

  const backup = (await readdir(fixture)).find((name) =>
    name.startsWith("dist.rtifact-backup-"),
  );
  assert.ok(backup);
  assert.equal(
    await readFile(path.join(fixture, backup, "important.txt"), "utf8"),
    "last good output",
  );
});

test("does not retry file recovery after reporting its backup", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const output = path.join(fixture, "artifact.html");
  await writeFile(output, "last good output");
  const state = await inspectFileOutput(output, true);
  let renameCount = 0;

  await assert.rejects(
    commitFileOutput("new output", output, state.authorization, {
      async rename(from, to) {
        renameCount += 1;
        if (renameCount === 1) return rename(from, to);
        if (renameCount === 2) throw new Error("primary publication failure");
        if (renameCount === 3) throw new Error("simulated recovery failure");
        return rename(from, to);
      },
      rm,
    }),
    /Recoverable backup:/,
  );

  assert.equal(renameCount, 3);
  const backup = (await readdir(fixture)).find((name) =>
    name.startsWith(".artifact.html.rtifact-backup-"),
  );
  assert.ok(backup);
  assert.equal(
    await readFile(path.join(fixture, backup), "utf8"),
    "last good output",
  );
});

test("does not treat a symbolic-link ownership marker as managed", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const output = path.join(fixture, "dist");
  const externalMarker = path.join(fixture, "external-marker.json");
  await writeFixture(output, { "index.html": "user data" });
  await writeFile(
    externalMarker,
    JSON.stringify({ tool: "rtifact", formatVersion: 1 }),
  );
  try {
    await symlink(externalMarker, path.join(output, ".rtifact-output.json"));
  } catch (error: unknown) {
    if (
      process.platform === "win32" &&
      (hasErrorCode(error, "EPERM") || hasErrorCode(error, "EACCES"))
    ) {
      const extDir = path.join(fixture, "external-dir");
      await mkdir(extDir, { recursive: true });
      await symlink(
        extDir,
        path.join(output, ".rtifact-output.json"),
        "junction",
      );
    } else {
      throw error;
    }
  }

  await assert.rejects(inspectOutput(output, false), /not managed by Rtifact/);
});

test("validates worker-prepared file and directory output before publication", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const fileOutput = path.join(fixture, "artifact.html");
  const source = path.join(fixture, "source.html");
  const preparedFile = path.join(fixture, "prepared.html");
  await writeFile(fileOutput, "last good file");
  await writeFile(source, "new file");
  try {
    await symlink(source, preparedFile);
  } catch (error: unknown) {
    if (
      process.platform === "win32" &&
      (hasErrorCode(error, "EPERM") || hasErrorCode(error, "EACCES"))
    ) {
      const sourceDir = path.join(fixture, "source-dir");
      await mkdir(sourceDir, { recursive: true });
      await symlink(sourceDir, preparedFile, "junction");
    } else {
      throw error;
    }
  }
  const fileState = await inspectFileOutput(fileOutput, true);
  await assert.rejects(
    publishPreparedFile(preparedFile, fileOutput, fileState.authorization),
    /symbolic-link/,
  );
  assert.equal(await readFile(fileOutput, "utf8"), "last good file");

  const output = path.join(fixture, "dist");
  const preparedDirectory = path.join(fixture, "prepared-directory");
  await writeFixture(output, { "important.txt": "last good directory" });
  await writeFixture(preparedDirectory, { "index.html": "new directory" });
  try {
    await symlink(source, path.join(preparedDirectory, "linked.html"));
  } catch (error: unknown) {
    if (
      process.platform === "win32" &&
      (hasErrorCode(error, "EPERM") || hasErrorCode(error, "EACCES"))
    ) {
      const sourceDir2 = path.join(fixture, "source-dir-2");
      await mkdir(sourceDir2, { recursive: true });
      await symlink(
        sourceDir2,
        path.join(preparedDirectory, "linked-dir"),
        "junction",
      );
    } else {
      throw error;
    }
  }
  const directoryState = await inspectOutput(output, true);
  await assert.rejects(
    publishPreparedDirectory(
      preparedDirectory,
      output,
      directoryState.authorization,
    ),
    /symbolic link/,
  );
  assert.equal(
    await readFile(path.join(output, "important.txt"), "utf8"),
    "last good directory",
  );
  assert.equal(
    (await readdir(fixture)).some((name) => name.includes("rtifact-stage")),
    false,
  );
});

test("restores the previous file when prepared-output publication fails", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const output = path.join(fixture, "artifact.html");
  const prepared = path.join(fixture, "prepared.html");
  await writeFile(output, "last good output");
  await writeFile(prepared, "new output");
  const state = await inspectFileOutput(output, true);
  let renameCount = 0;
  await assert.rejects(
    publishPreparedFile(prepared, output, state.authorization, {
      async rename(from, to) {
        renameCount += 1;
        if (renameCount === 2) throw new Error("publication failure");
        return rename(from, to);
      },
      rm,
    }),
    /publication failure/,
  );
  assert.equal(renameCount, 3);
  assert.equal(await readFile(output, "utf8"), "last good output");
});

test("preserves a file publication error when stage cleanup also fails", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const output = path.join(fixture, "artifact.html");
  const prepared = path.join(fixture, "prepared.html");
  await writeFile(output, "last good output");
  await writeFile(prepared, "new output");
  const state = await inspectFileOutput(output, true);
  let renameCount = 0;
  let failure: unknown;
  try {
    await publishPreparedFile(prepared, output, state.authorization, {
      async rename(from, to) {
        renameCount += 1;
        if (renameCount === 2) throw new Error("primary publication failure");
        return rename(from, to);
      },
      async rm(target, options) {
        if (String(target).includes("rtifact-stage")) {
          throw new Error("stage cleanup failure");
        }
        return rm(target, options);
      },
    });
    assert.fail("Expected publication to fail.");
  } catch (error) {
    failure = error;
  }
  assert.ok(failure instanceof Error);
  assert.match(failure.message, /^primary publication failure/);
  assert.match(failure.message, /Cleanup also failed: stage cleanup failure/);
  assert.equal(await readFile(output, "utf8"), "last good output");
});

test("preserves a directory publication error when stage cleanup also fails", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const output = path.join(fixture, "dist");
  const prepared = path.join(fixture, "prepared");
  await writeFixture(output, { "important.txt": "last good output" });
  await writeFixture(prepared, { "index.html": "new output" });
  const state = await inspectOutput(output, true);
  let renameCount = 0;
  let failure: unknown;
  try {
    await publishPreparedDirectory(prepared, output, state.authorization, {
      async rename(from, to) {
        renameCount += 1;
        if (renameCount === 2) throw new Error("primary publication failure");
        return rename(from, to);
      },
      async rm(target, options) {
        if (String(target).includes("rtifact-stage")) {
          throw new Error("stage cleanup failure");
        }
        return rm(target, options);
      },
    });
    assert.fail("Expected publication to fail.");
  } catch (error) {
    failure = error;
  }
  assert.ok(failure instanceof Error);
  assert.match(failure.message, /^primary publication failure/);
  assert.match(failure.message, /Cleanup also failed: stage cleanup failure/);
  assert.equal(
    await readFile(path.join(output, "important.txt"), "utf8"),
    "last good output",
  );
});

test("restores the previous directory when prepared-output publication fails", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const output = path.join(fixture, "dist");
  const prepared = path.join(fixture, "prepared");
  await writeFixture(output, { "important.txt": "last good output" });
  await writeFixture(prepared, { "index.html": "new output" });
  const state = await inspectOutput(output, true);
  let renameCount = 0;
  await assert.rejects(
    publishPreparedDirectory(prepared, output, state.authorization, {
      async rename(from, to) {
        renameCount += 1;
        if (renameCount === 2) throw new Error("publication failure");
        return rename(from, to);
      },
      rm,
    }),
    /publication failure/,
  );
  assert.equal(renameCount, 3);
  assert.equal(
    await readFile(path.join(output, "important.txt"), "utf8"),
    "last good output",
  );
  assert.equal(
    (await readdir(fixture)).some((name) => name.includes("rtifact-stage")),
    false,
  );
});
