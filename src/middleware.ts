import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";
import { isTrustedOrigin } from "./lib/auth/identity";

export const onRequest = defineMiddleware(async (context, next) => {
  const { request } = context;
  const method = request.method.toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    const cookie = request.headers.get("cookie") ?? "";
    if (cookie.length > 0) {
      const origin = request.headers.get("origin");
      const referer = request.headers.get("referer");
      const appUrl =
        (env as { APP_URL?: string }).APP_URL ?? context.url.origin;
      if (!isTrustedOrigin(origin ?? referer, [appUrl])) {
        return new Response(JSON.stringify({ error: "Untrusted origin" }), {
          status: 403,
          headers: { "content-type": "application/json" },
        });
      }
    }
  }
  return next();
});
