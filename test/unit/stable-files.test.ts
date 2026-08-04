import assert from "node:assert/strict";
import { lstat, rm, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { hasErrorCode } from "../../src/errors.js";
import { readStableFile, StableFileError } from "../../src/stable-files.js";
import { makeFixture } from "../helpers.js";

test("reads only bounded regular files with a stable identity", async (t) => {
  const fixture = await makeFixture();
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const file = path.join(fixture, "source.txt");
  const link = path.join(fixture, "source-link.txt");
  await writeFile(file, "stable contents");
  let hasSymlink = true;
  try {
    await symlink(file, link);
  } catch (error: unknown) {
    if (
      process.platform === "win32" &&
      (hasErrorCode(error, "EPERM") || hasErrorCode(error, "EACCES"))
    ) {
      hasSymlink = false;
    } else {
      throw error;
    }
  }

  assert.equal(
    (await readStableFile(file, 32)).toString("utf8"),
    "stable contents",
  );
  await assert.rejects(
    readStableFile(file, 4),
    (error: StableFileError) => error.reason === "too-large",
  );
  if (hasSymlink) {
    await assert.rejects(
      readStableFile(link, 32),
      (error: StableFileError) => error.reason === "unsupported",
    );
  }

  const identity = await lstat(file, { bigint: true });
  await assert.rejects(
    readStableFile(file, 32, { ...identity, ino: identity.ino + 1n }),
    (error: StableFileError) => error.reason === "changed",
  );
  await writeFile(file, "grown after approval");
  await assert.rejects(
    readStableFile(file, 4, identity),
    (error: StableFileError) => error.reason === "changed",
  );
});
