interface YoloJsxErrorOptions extends ErrorOptions {
  code?: string;
}

interface DetailedError extends Error {
  id?: string;
  loc?: { file?: string };
  frame?: string;
}

export class YoloJsxError extends Error {
  code: string;

  constructor(message: string, options: YoloJsxErrorOptions = {}) {
    super(message, options);
    this.name = "YoloJsxError";
    this.code = options.code ?? "YOLOJSX_ERROR";
  }
}

export function hasErrorCode(error: unknown, code: string) {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === code
  );
}

export function formatError(error: unknown) {
  if (!(error instanceof Error)) {
    return String(error);
  }

  const detailedError = error as DetailedError;
  const details = [detailedError.message];

  if (detailedError.id && !detailedError.message.includes(detailedError.id)) {
    details.push(`Source: ${detailedError.id}`);
  }

  if (
    detailedError.loc?.file &&
    !details.join("\n").includes(detailedError.loc.file)
  ) {
    details.push(`Source: ${detailedError.loc.file}`);
  }

  if (
    detailedError.frame &&
    !detailedError.message.includes(detailedError.frame)
  ) {
    details.push(detailedError.frame);
  }

  if (detailedError.cause instanceof Error) {
    const cause = formatError(detailedError.cause);
    const current = details.join("\n");
    if (!current.includes(cause)) {
      details.push(cause);
    }
  }

  return details.join("\n");
}
