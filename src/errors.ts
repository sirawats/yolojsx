interface RtifactErrorOptions extends ErrorOptions {
  code?: string;
}

interface DetailedError extends Error {
  id?: string;
  loc?: { file?: string; line?: number; column?: number };
  frame?: string;
}

export class RtifactError extends Error {
  code: string;

  constructor(message: string, options: RtifactErrorOptions = {}) {
    super(message, options);
    this.name = "RtifactError";
    this.code = options.code ?? "RTIFACT_ERROR";
  }
}

export function hasErrorCode(error: unknown, code: string) {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === code
  );
}

function formatErrorInternal(error: unknown, redactSource: boolean): string {
  if (!(error instanceof Error)) {
    return String(error);
  }

  const detailedError = error as DetailedError;
  const sourceBearing = Boolean(
    redactSource ||
    detailedError.frame ||
    detailedError.id ||
    detailedError.loc,
  );
  const message = sourceBearing
    ? (detailedError.message.split(/\r?\n/, 1)[0] ?? detailedError.name)
    : detailedError.message;
  const details = [message];

  if (detailedError.id && !detailedError.message.includes(detailedError.id)) {
    details.push(`Source: ${detailedError.id}`);
  }

  if (
    detailedError.loc?.file &&
    !details.join("\n").includes(detailedError.loc.file)
  ) {
    const line = detailedError.loc.line;
    const column = detailedError.loc.column;
    const position =
      typeof line === "number"
        ? `:${line}${typeof column === "number" ? `:${column}` : ""}`
        : "";
    details.push(`Source: ${detailedError.loc.file}${position}`);
  } else if (
    typeof detailedError.loc?.line === "number" &&
    !details.join("\n").includes(`:${detailedError.loc.line}`)
  ) {
    details.push(
      `Location: ${detailedError.loc.line}${
        typeof detailedError.loc.column === "number"
          ? `:${detailedError.loc.column}`
          : ""
      }`,
    );
  }

  if (detailedError.cause instanceof Error) {
    const cause = formatErrorInternal(detailedError.cause, sourceBearing);
    const current = details.join("\n");
    if (!current.includes(cause)) {
      details.push(cause);
    }
  }

  return details.join("\n");
}

export function formatError(error: unknown) {
  return formatErrorInternal(error, false);
}

export function sanitizeDiagnostic(message: string, maxBytes: number) {
  let sanitized = message.replace(/[^\P{Cc}\n\t]/gu, "");
  const environmentValues = Object.entries(process.env)
    .filter(([name]) =>
      /(?:^|_)(?:AUTH|COOKIE|CREDENTIAL|KEY|PASS(?:WORD|WD)?|SECRET|SESSION|TOKEN)(?:_|$)/i.test(
        name,
      ),
    )
    .map(([, value]) => value)
    .filter((value): value is string => Boolean(value && value.length >= 8))
    .sort((left, right) => right.length - left.length);
  for (const value of environmentValues) {
    sanitized = sanitized.replaceAll(value, "[redacted]");
  }
  if (Buffer.byteLength(sanitized) <= maxBytes) return sanitized;

  const suffix = "\n… diagnostic truncated";
  const available = Math.max(0, maxBytes - Buffer.byteLength(suffix));
  const bytes = Buffer.from(sanitized);
  let end = available;
  let prefix = bytes.subarray(0, end).toString("utf8");
  while (prefix.endsWith("�")) {
    end -= 1;
    prefix = bytes.subarray(0, end).toString("utf8");
  }
  while (Buffer.byteLength(prefix) > available) prefix = prefix.slice(0, -1);
  return `${prefix}${suffix}`;
}
