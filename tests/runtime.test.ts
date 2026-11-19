import { describe, expect, it } from "vitest";

describe("service health", () => {
  it("returns a non-cacheable liveness response without configuration secrets", async () => {
    const { GET } = await import("../src/pages/health");
    const response = GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({
      status: "ok",
      service: "obsidi.xyz",
    });
  });
});
