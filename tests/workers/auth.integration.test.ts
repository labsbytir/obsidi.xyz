import migrationSql from "../../drizzle/0000_dry_bedlam.sql?raw";
import { env } from "cloudflare:workers";
import { beforeEach, describe, expect, it } from "vitest";
import worker from "../worker";
import { createAuth, requireUser } from "../../src/lib/auth/server";
import { isUuid } from "../../src/lib/auth/identity";
import { clearTestOutbox, getTestOutbox } from "../../src/lib/email/messages";

const TEST_ENV = {
  DB: env.DB,
  APP_URL: "http://localhost",
  APP_ENV: "test",
  BETTER_AUTH_SECRET: "test-only-secret-0123456789abcdef-0123456789abcdef",
  TURNSTILE_SECRET_KEY: "unconfigured-turnstile-secret",
} as never;

async function applyMigration(): Promise<void> {
  for (const statement of migrationSql.split("--> statement-breakpoint")) {
    // This miniflare D1 build only parses the first line of an exec call,
    // so collapse each generated statement to a single line.
    const sql = statement.replace(/\s+/g, " ").trim().replace(/;$/, "");
    if (sql.length > 0) {
      try {
        await env.DB.exec(sql);
      } catch (error) {
        if (error instanceof Error && /already exists/i.test(error.message)) {
          continue;
        }
        throw error;
      }
    }
  }
}

beforeEach(async () => {
  await applyMigration();
  clearTestOutbox();
});

describe("D1 identity and sessions", () => {
  it("applies the generated auth migration to isolated D1", async () => {
    const tables = await env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('user','session','account','verification') ORDER BY name"
    ).all<{ name: string }>();
    expect(tables.results.map((row) => row.name)).toEqual([
      "account",
      "session",
      "user",
      "verification",
    ]);
  });

  it("assigns a stable server UUID that survives email changes", async () => {
    const auth = createAuth(TEST_ENV);
    const signUp = await auth.api.signUpEmail({
      body: {
        email: "uuid@example.com",
        password: "correct-horse-battery-staple-1",
        name: "Uuid User",
      },
    });
    const userId = (signUp as { user?: { id?: string } })?.user?.id;
    expect(isUuid(userId)).toBe(true);
    await env.DB.prepare("UPDATE user SET email = ? WHERE id = ?")
      .bind("uuid-changed@example.com", userId)
      .run();
    const row = await env.DB.prepare("SELECT id FROM user WHERE id = ?")
      .bind(userId)
      .first<{ id: string }>();
    expect(row?.id).toBe(userId);
  });

  it("verifies email then resolves the session owner", async () => {
    const auth = createAuth(TEST_ENV);
    await auth.api.signUpEmail({
      body: {
        email: "session@example.com",
        password: "correct-horse-battery-staple-1",
        name: "Session User",
      },
    });
    const verificationEmail = getTestOutbox().find(
      (entry) => entry.template === "verification"
    );
    expect(verificationEmail).toBeDefined();
    const token = new URL(verificationEmail!.parameters.link).searchParams.get(
      "token"
    );
    expect(token).toBeTruthy();
    let verifiedRedirect = false;
    try {
      await auth.api.verifyEmail({
        query: { token: token!, callbackURL: "/" },
      });
    } catch (error) {
      verifiedRedirect =
        typeof error === "object" &&
        error !== null &&
        "statusCode" in error &&
        (error as { statusCode: number }).statusCode === 302;
      if (!verifiedRedirect) throw error;
    }
    expect(verifiedRedirect).toBe(true);
    const verified = await env.DB.prepare(
      "SELECT email_verified FROM user WHERE email = ?"
    )
      .bind("session@example.com")
      .first<{ email_verified: number }>();
    expect(verified?.email_verified).toBe(1);

    const signIn = (await auth.api.signInEmail({
      body: {
        email: "session@example.com",
        password: "correct-horse-battery-staple-1",
      },
      headers: new Headers(),
      returnHeaders: true,
    })) as { headers: Headers; response: { user: { id: string } } };
    const setCookie = signIn.headers.get("set-cookie") ?? "";
    const sessionCookie = setCookie
      .split(",")
      .map((part) => part.trim().split(";")[0])
      .find((part) => part.startsWith("better-auth.session_token="));
    expect(sessionCookie).toBeTruthy();
    const user = await requireUser(
      new Request("http://localhost/dashboard", {
        headers: { cookie: sessionCookie! },
      }),
      TEST_ENV
    );
    expect(user.id).toBe(signIn.response.user.id);
    await expect(
      requireUser(new Request("http://localhost/dashboard"), TEST_ENV)
    ).rejects.toThrow();
    await expect(
      auth.api.signInEmail({
        body: { email: "session@example.com", password: "wrong-password-1" },
        headers: new Headers(),
      })
    ).rejects.toThrow();
  });

  it("rejects sign-up without a Turnstile token", async () => {
    const auth = createAuth(TEST_ENV);
    const response = await auth.handler(
      new Request("http://localhost/api/auth/sign-up/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: "captcha@example.com",
          password: "correct-horse-battery-staple-1",
          name: "Captcha User",
        }),
      })
    );
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it("denies direct protected requests without a valid session", async () => {
    const anonymous = await worker.fetch(
      new Request("http://localhost/protected/ping")
    );
    expect(anonymous.status).toBe(401);
    const forged = await worker.fetch(
      new Request("http://localhost/protected/ping", {
        headers: { cookie: "better-auth.session_token=forged-token" },
      })
    );
    expect(forged.status).toBe(401);

    const auth = createAuth(TEST_ENV);
    await auth.api.signUpEmail({
      body: {
        email: "ping@example.com",
        password: "correct-horse-battery-staple-1",
        name: "Ping User",
      },
    });
    const verificationEmail = getTestOutbox().find(
      (entry) => entry.template === "verification"
    );
    const token = new URL(verificationEmail!.parameters.link).searchParams.get(
      "token"
    );
    try {
      await auth.api.verifyEmail({
        query: { token: token!, callbackURL: "/" },
      });
    } catch (error) {
      if (
        typeof error !== "object" ||
        error === null ||
        !("statusCode" in error)
      ) {
        throw error;
      }
    }
    const signIn = (await auth.api.signInEmail({
      body: {
        email: "ping@example.com",
        password: "correct-horse-battery-staple-1",
      },
      headers: new Headers(),
      returnHeaders: true,
    })) as { headers: Headers; response: { user: { id: string } } };
    const sessionCookie = (signIn.headers.get("set-cookie") ?? "")
      .split(",")
      .map((part) => part.trim().split(";")[0])
      .find((part) => part.startsWith("better-auth.session_token="));
    expect(sessionCookie).toBeTruthy();
    const authorized = await worker.fetch(
      new Request("http://localhost/protected/ping", {
        headers: { cookie: sessionCookie! },
      })
    );
    expect(authorized.status).toBe(200);
    expect(await authorized.json()).toEqual({
      userId: signIn.response.user.id,
    });
  });

  it("issues single-use expiring password-reset tokens", async () => {
    const auth = createAuth(TEST_ENV);
    await auth.api.signUpEmail({
      body: {
        email: "reset@example.com",
        password: "correct-horse-battery-staple-1",
        name: "Reset User",
      },
    });
    await auth.api.requestPasswordReset({
      body: {
        email: "reset@example.com",
        redirectTo: "http://localhost/reset",
      },
    });
    const resetEmail = getTestOutbox().find(
      (entry) => entry.to === "reset@example.com" && entry.template === "reset"
    );
    expect(resetEmail).toBeDefined();
    const token = new URL(resetEmail!.parameters.link).pathname
      .split("/")
      .filter(Boolean)
      .pop();
    expect(token).toBeTruthy();
    await auth.api.resetPassword({
      body: { newPassword: "new-correct-horse-battery-1", token: token! },
    });
    await expect(
      auth.api.resetPassword({
        body: { newPassword: "another-correct-horse-1", token: token! },
      })
    ).rejects.toThrow();
    await expect(
      auth.api.resetPassword({
        body: {
          newPassword: "expired-correct-horse-1",
          token: "expired-token",
        },
      })
    ).rejects.toThrow();

    await auth.api.requestPasswordReset({
      body: {
        email: "reset@example.com",
        redirectTo: "http://localhost/reset",
      },
    });
    const secondEmail = getTestOutbox()
      .filter(
        (entry) =>
          entry.to === "reset@example.com" && entry.template === "reset"
      )
      .pop();
    const secondToken = new URL(secondEmail!.parameters.link).pathname
      .split("/")
      .filter(Boolean)
      .pop();
    await env.DB.prepare("UPDATE verification SET expires_at = 1").run();
    await expect(
      auth.api.resetPassword({
        body: { newPassword: "stale-correct-horse-1", token: secondToken! },
      })
    ).rejects.toThrow();
  });
});
