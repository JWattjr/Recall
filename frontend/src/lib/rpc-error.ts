export function contractReadReason(error: unknown): string {
  const e = error as {
    message?: string;
    cause?: { data?: { receipt?: { result?: string } } };
  };
  const encoded = e.cause?.data?.receipt?.result;
  if (encoded) {
    try {
      return Buffer.from(encoded, "base64")
        .toString("utf8")
        .replace(/^[\x00-\x1f]+/, "");
    } catch {
      /* Use the safe message below. */
    }
  }
  return e.message ?? String(error);
}
