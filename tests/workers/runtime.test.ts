import { env } from "cloudflare:workers";
import { expect, it } from "vitest";
import worker from "../worker";

it("serves the health contract inside workerd", async () => {
  const response = worker.fetch();
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    status: "ok",
    service: "obsidi.xyz",
  });
});

it("uses writable local D1 and private R2 test bindings", async () => {
  expect(env.APP_ENV).toBe("test");
  await env.DB.exec("CREATE TABLE runtime_probe (value TEXT NOT NULL)");
  await env.DB.prepare("INSERT INTO runtime_probe VALUES (?)")
    .bind("local")
    .run();
  expect(
    await env.DB.prepare("SELECT value FROM runtime_probe").first("value")
  ).toBe("local");
  await env.VAULTS.put("probe", "local-only");
  expect(await (await env.VAULTS.get("probe"))?.text()).toBe("local-only");
});
