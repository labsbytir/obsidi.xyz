import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { createAuth } from "@/lib/auth/server";

export const prerender = false;

async function handler(request: Request): Promise<Response> {
  const auth = createAuth(env as never);
  return auth.handler(request);
}

export const GET: APIRoute = ({ request }) => handler(request);
export const POST: APIRoute = ({ request }) => handler(request);
