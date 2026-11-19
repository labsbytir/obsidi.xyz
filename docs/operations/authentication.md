# Authentication and account security

Better Auth with email/password, verified email, Turnstile, and D1-backed
UUID identity. Implementation: `src/lib/auth/server.ts`.

## Required secrets

| Secret                      | Where                    | Purpose                                                                     |
| --------------------------- | ------------------------ | --------------------------------------------------------------------------- |
| `BETTER_AUTH_SECRET`        | Worker secret (all envs) | Session/token cryptography. Production refuses to boot without it.          |
| `TURNSTILE_SECRET_KEY`      | Worker secret            | Server-side Turnstile verification for sign-up, sign-in, password reset.    |
| `PUBLIC_TURNSTILE_SITE_KEY` | Build-time public var    | Browser widget. Never a secret, but keep it out of server code.             |
| `BETTER_AUTH_API_KEY`       | Worker secret (task 12)  | Infrastructure Dashboard/Sentinel. Missing key blocks production readiness. |

```bash
npx wrangler secret put BETTER_AUTH_SECRET
npx wrangler secret put TURNSTILE_SECRET_KEY
```

Local development uses `.dev.vars` (never committed):

```bash
BETTER_AUTH_SECRET=test-only-secret-0123456789abcdef-0123456789abcdef
TURNSTILE_SECRET_KEY=<cloudflare-test-or-real-secret>
PUBLIC_TURNSTILE_SITE_KEY=<turnstile-site-key>
```

Cloudflare test keys that always pass: site key
`1x00000000000000000000AA`, secret
`1x0000000000000000000000000000000AA`, dummy token
`XXXX.DUMMY.TOKEN.XXXX`. Never use test keys in production.

## Local behavior

- Sign-up, password sign-in, and password-reset requests validate Turnstile
  server-side through the Better Auth captcha plugin. Missing, invalid, or
  expired tokens are rejected before any account or session is created.
- Verification and recovery emails go through `sendTransactionalEmail`. Until
  task 11 provisions the production sender, they are recorded in the local
  test outbox, never sent.
- Tokens expire (one hour default) and password-reset tokens are single-use.
  Reused or expired links show an error, never a session.
- Cookie-authenticated mutations (any non-GET/HEAD with cookies) require a
  trusted `Origin`/`Referer` matching `APP_URL`; anything else gets 403.
- `requireUser` resolves identity from the verified server-side session and
  rejects missing sessions (401) and banned accounts (403). Supplied UUIDs,
  hidden form fields, and unguessable URLs are never authorization.
- `requireVerifiedUser` adds the verified-email gate. Publishing (task 6)
  and checkout (task 8) must call it, not `requireUser`.

## Operator boundaries

- There is no self-granted admin. Operator identity is established through
  Better Auth Infrastructure (task 12), never the first registered user.
- Session management (`/settings/sessions`) shows only the caller's
  sessions; revocation is per-session or all-others plus sign-out.
- Audit: every revocation, failed sign-in, and token use is logged server
  side without note bodies, passwords, raw keys, or session cookies
  (task 12 wires provider audit logs; application events follow in task 4).
- Rate limiting: Better Auth endpoint limits plus Turnstile apply to all
  authentication and recovery endpoints. Do not disable them to work
  around a misconfigured widget.

## Verification

```bash
npm test -- tests/auth.test.ts
npm run test:workers -- auth.integration.test.ts
npm run test:e2e -- auth.spec.ts
```

To regenerate the Better Auth schema after upgrading `better-auth`:

```bash
npx auth generate --config auth.cli.ts --output src/db/auth-schema.ts --yes
npx drizzle-kit generate
```

`auth.cli.ts` mirrors the production auth options for the CLI without
Workers bindings. Keep it in sync with `src/lib/auth/server.ts`.

Browser checks run without Turnstile keys: the widget reports itself
unavailable, submit stays disabled, and protected pages redirect to
sign-in. Real challenge solving is covered by the Workers integration
tests with isolated D1.
