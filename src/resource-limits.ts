const MEBIBYTE = 1024 * 1024;

export const BUILD_RESOURCE_LIMITS = {
  files: 10_000,
  fileBytes: 16 * MEBIBYTE,
  inputBytes: 128 * MEBIBYTE,
  outputFileBytes: 32 * MEBIBYTE,
  outputBytes: 128 * MEBIBYTE,
  packFiles: 4_096,
  packInputBytes: 64 * MEBIBYTE,
  normalizedBytes: 96 * MEBIBYTE,
  artifactBytes: 128 * MEBIBYTE,
} as const;

export const BUILD_WORKER_LIMITS = {
  requestBytes: 16 * 1024,
  resultBytes: 64 * 1024,
  diagnosticBytes: 8 * 1024,
  warningCount: 32,
  warningBytes: 2 * 1024,
  warningTotalBytes: 16 * 1024,
  // Calibrated release values are updated from `npm run stress:release` evidence.
  timeoutMs: 120_000,
  maxOldSpaceSizeMiB: 768,
} as const;
