import { describe, expect, it, vi } from "vitest";

describe("account identity boundary", () => {
  it("accepts server UUIDs and rejects client-supplied ownership strings", async () => {
    const { isUuid } = await import("../src/lib/auth/identity");
    expect(isUuid("b57c7291-c14d-4db3-aa16-c65ba2aef3c2")).toBe(true);
    expect(isUuid("not-a-uuid")).toBe(false);
    expect(isUuid("")).toBe(false);
  });

  it("denies cross-site cookie mutations from unrelated origins", async () => {
    const { isTrustedOrigin } = await import("../src/lib/auth/identity");
    expect(
      isTrustedOrigin("https://obsidi.xyz/dashboard", ["https://obsidi.xyz"])
    ).toBe(true);
    expect(
      isTrustedOrigin("https://evil.example/api/auth/sign-out", [
        "https://obsidi.xyz",
      ])
    ).toBe(false);
    expect(isTrustedOrigin(null, ["https://obsidi.xyz"])).toBe(false);
  });
});

describe("bot protection", () => {
  it("rejects authentication without a Turnstile token before creating sessions", async () => {
    const { verifyTurnstileToken } = await import("../src/lib/auth/identity");
    await expect(verifyTurnstileToken(null)).rejects.toThrow(/turnstile/i);
  });

  it("rejects invalid Turnstile tokens", async () => {
    const { verifyTurnstileToken } = await import("../src/lib/auth/identity");
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ success: false }), { status: 200 })
      );
    try {
      await expect(
        verifyTurnstileToken("invalid-token", { secret: "test-secret" })
      ).rejects.toThrow(/turnstile/i);
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it("fails closed when the Turnstile service is unreachable", async () => {
    const { verifyTurnstileToken } = await import("../src/lib/auth/identity");
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new Error("network down"));
    try {
      await expect(
        verifyTurnstileToken("some-token", { secret: "test-secret" })
      ).rejects.toThrow(/turnstile/i);
    } finally {
      fetchSpy.mockRestore();
    }
  });
});

describe("transactional email", () => {
  it("queues verification email locally without exposing secrets", async () => {
    const { clearTestOutbox, getTestOutbox, sendTransactionalEmail } =
      await import("../src/lib/email/messages");
    clearTestOutbox();
    const result = await sendTransactionalEmail(
      {},
      {
        to: "user@example.com",
        template: "verification",
        parameters: { link: "https://obsidi.xyz/verify?token=abc" },
      }
    );
    expect(result.messageId).toBeTruthy();
    const outbox = getTestOutbox();
    expect(outbox).toHaveLength(1);
    expect(JSON.stringify(outbox)).not.toMatch(/SECRET/i);
  });
});
