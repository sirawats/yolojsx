import { lstat, open } from "node:fs/promises";

export interface StableFileIdentity {
  dev: bigint;
  ino: bigint;
  size: bigint;
}

export class StableFileError extends Error {
  constructor(
    message: string,
    readonly reason: "changed" | "too-large" | "unsupported",
  ) {
    super(message);
    this.name = "StableFileError";
  }
}

function sameIdentity(left: StableFileIdentity, right: StableFileIdentity) {
  return (
    left.dev === right.dev && left.ino === right.ino && left.size === right.size
  );
}

export async function readStableFile(
  file: string,
  maxBytes: number,
  expected?: StableFileIdentity,
) {
  const initial = await lstat(file, { bigint: true });
  if (initial.isSymbolicLink() || !initial.isFile()) {
    throw new StableFileError(
      `File is not a regular non-symbolic-link file: ${file}`,
      "unsupported",
    );
  }
  if (expected && !sameIdentity(initial, expected)) {
    throw new StableFileError(
      `File changed before reading: ${file}`,
      "changed",
    );
  }
  if (initial.size > BigInt(maxBytes)) {
    throw new StableFileError(
      `File exceeds ${maxBytes} bytes: ${file}`,
      "too-large",
    );
  }

  const handle = await open(file, "r");
  try {
    const opened = await handle.stat({ bigint: true });
    if (!opened.isFile() || !sameIdentity(opened, initial)) {
      throw new StableFileError(
        `File changed before reading: ${file}`,
        "changed",
      );
    }

    const initialSize = Number(initial.size);
    const contents = Buffer.alloc(initialSize + 1);
    let offset = 0;
    while (offset < contents.length) {
      const { bytesRead } = await handle.read(
        contents,
        offset,
        contents.length - offset,
        offset,
      );
      if (bytesRead === 0) break;
      offset += bytesRead;
    }
    const final = await handle.stat({ bigint: true });
    if (!sameIdentity(final, opened) || offset !== initialSize) {
      throw new StableFileError(
        `File changed while reading: ${file}`,
        "changed",
      );
    }
    return contents.subarray(0, offset);
  } finally {
    await handle.close();
  }
}
