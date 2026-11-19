import { env } from "cloudflare:workers";
import { GET as healthGET } from "../src/pages/health";
import { requireUser } from "../src/lib/auth/server";

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/protected/ping") {
      try {
        const user = await requireUser(request, env as never);
        return Response.json({ userId: user.id });
      } catch (response) {
        if (response instanceof Response) return response;
        throw response;
      }
    }
    return healthGET();
  },
};
