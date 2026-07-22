export class YoloJsxError extends Error {
  constructor(message, options = {}) {
    super(message, options);
    this.name = "YoloJsxError";
    this.code = options.code ?? "YOLOJSX_ERROR";
  }
}

export function formatError(error) {
  if (!(error instanceof Error)) {
    return String(error);
  }

  const details = [error.message];

  if (error.id && !error.message.includes(error.id)) {
    details.push(`Source: ${error.id}`);
  }

  if (error.loc?.file && !details.join("\n").includes(error.loc.file)) {
    details.push(`Source: ${error.loc.file}`);
  }

  if (error.frame && !error.message.includes(error.frame)) {
    details.push(error.frame);
  }

  if (error.cause instanceof Error) {
    const cause = formatError(error.cause);
    const current = details.join("\n");
    if (!current.includes(cause)) {
      details.push(cause);
    }
  }

  return details.join("\n");
}
