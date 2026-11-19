import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { captcha } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/d1";
import { sendTransactionalEmail } from "../email/messages";
import * as authSchema from "../../db/auth-schema";

export interface AuthEnv {
  DB: D1Database;
  APP_URL?: string;
  APP_ENV?: string;
  BETTER_AUTH_SECRET?: string;
  TURNSTILE_SECRET_KEY?: string;
  EMAIL?: {
    send: (message: {
      from: string;
      to: string;
      subject: string;
      text: string;
      html: string;
    }) => Promise<{ messageId: string } | void> | { messageId: string } | void;
  };
}

const TEST_SECRET = "test-only-secret-0123456789abcdef-0123456789abcdef";

export function createAuth(env: AuthEnv) {
  if (env.APP_ENV === "production" && !env.BETTER_AUTH_SECRET) {
    throw new Error("BETTER_AUTH_SECRET is required in production");
  }
  const db = drizzle(env.DB);
  const baseURL = env.APP_URL ?? "http://127.0.0.1:4321";
  return betterAuth({
    baseURL,
    secret: env.BETTER_AUTH_SECRET ?? TEST_SECRET,
    trustedOrigins: [baseURL],
    advanced: {
      ipAddress: {
        ipAddressHeaders: ["cf-connecting-ip"],
      },
      database: {
        generateId: "uuid",
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url }) => {
        await sendTransactionalEmail(env, {
          to: user.email,
          template: "reset",
          parameters: { link: url },
        });
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        await sendTransactionalEmail(env, {
          to: user.email,
          template: "verification",
          parameters: { link: url },
        });
      },
    },
    user: {
      deleteUser: {
        enabled: true,
      },
    },
    plugins: [
      captcha({
        provider: "cloudflare-turnstile",
        secretKey: env.TURNSTILE_SECRET_KEY ?? "unconfigured-turnstile-secret",
      }),
    ],
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: authSchema,
    }),
  });
}

export type Auth = ReturnType<typeof createAuth>;

export async function requireUser(
  request: Request,
  env: AuthEnv
): Promise<{ id: string; email: string; emailVerified: boolean }> {
  const auth = createAuth(env);
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    throw Response.json({ error: "Authentication required" }, { status: 401 });
  }
  const user = session.user as {
    id: string;
    email: string;
    emailVerified: boolean;
    banned?: boolean;
  };
  if (user.banned === true) {
    throw Response.json({ error: "Account unavailable" }, { status: 403 });
  }
  return { id: user.id, email: user.email, emailVerified: user.emailVerified };
}

/**
 * Publishing, checkout, and other irreversible operations require a verified
 * email in addition to a valid session. Call this instead of requireUser.
 */
export async function requireVerifiedUser(
  request: Request,
  env: AuthEnv
): Promise<{ id: string; email: string }> {
  const user = await requireUser(request, env);
  if (user.emailVerified !== true) {
    throw Response.json(
      { error: "Verify your email before continuing" },
      { status: 403 }
    );
  }
  return { id: user.id, email: user.email };
}
