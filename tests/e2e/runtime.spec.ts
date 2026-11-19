import { expect, test } from "@playwright/test";

test("Astro serves the health route from its local Worker", async ({
  request,
}) => {
  const response = await request.get("/health");
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe("no-store");
  expect(await response.json()).toEqual({
    status: "ok",
    service: "obsidi.xyz",
  });
});
