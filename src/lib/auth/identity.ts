const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

export function isTrustedOrigin(
  originOrUrl: string | null | undefined,
  allowedOrigins: string[]
): boolean {
  if (!originOrUrl) return false;
  let origin: string;
  try {
    origin = new URL(originOrUrl).origin;
  } catch {
    return false;
  }
  return allowedOrigins.includes(origin);
}

export async function verifyTurnstileToken(
  token: string | null | undefined,
  options?: { secret?: string; remoteIp?: string }
): Promise<void> {
  if (!token || typeof token !== "string" || token.length === 0) {
    throw new Error("turnstile token required");
  }
  const secret = options?.secret ?? process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    throw new Error("turnstile secret not configured");
  }
  let response: Response;
  try {
    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", token);
    if (options?.remoteIp) body.set("remoteip", options.remoteIp);
    response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body }
    );
  } catch {
    throw new Error("turnstile verification unavailable");
  }
  let data: { success?: boolean } | null = null;
  try {
    data = (await response.json()) as { success?: boolean };
  } catch {
    throw new Error("turnstile verification unavailable");
  }
  if (!data || data.success !== true) {
    throw new Error("turnstile verification failed");
  }
}
