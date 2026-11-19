import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { captcha } from "better-auth/plugins";

export const auth = betterAuth({
  baseURL: "http://127.0.0.1:4321",
  secret: "test-only-secret-0123456789abcdef-0123456789abcdef",
  trustedOrigins: ["http://127.0.0.1:4321"],
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  plugins: [
    captcha({
      provider: "cloudflare-turnstile",
      secretKey: "unconfigured-turnstile-secret",
    }),
  ],
  database: drizzleAdapter({} as never, {
    provider: "sqlite",
  }),
});
