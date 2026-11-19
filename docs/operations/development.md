# Local development

Use Node.js 24 and npm. The application is under construction; production readiness is tracked in `openspec/changes/build-obsidi-saas/tasks.md`.

```bash
npm ci
npm run types
npm run dev
```

Open `http://127.0.0.1:4321`. `/health` is liveness only; it does not claim external integrations are configured.

## Verification

```bash
npm run verify
npm run build
npx playwright install chromium
npm run test:e2e
```

`verify` uses the pinned development OpenSpec CLI. Formatting, Astro/TypeScript, unit tests, local Workers integration tests, and strict OpenSpec validation must pass. The pre-commit hook runs staged formatting, type checking, and unit tests.

`check` regenerates ignored Worker binding/runtime types from the pinned Wrangler configuration before type checking. Generated platform declarations are not committed.

## Resource isolation

- Default Wrangler resources are `obsidi-local`, simulated locally. There are no remote bindings.
- Workers tests have a separate `tests/wrangler.jsonc` and disposable D1/R2 resources.
- Production bindings exist only in the explicit `production` environment.
- Preview IDs are non-deployable placeholders until isolated resources are provisioned in task 11. Do not substitute production IDs.
- No automatic deployment occurs on push. The deployment scripts are deliberate operator actions, not part of tests or CI.
- Never run production deploy before all OpenSpec release gates pass.

Email, Stripe, Analytics Engine, Better Auth Infrastructure, and authentication are not implemented by the runtime milestone. Do not add production secrets to local test files.

## Indexing

Gadget configuration retains Ollama embeddings. The semantic index was unavailable during initialization because its provider was not configured/authenticated. Configure the intended local provider before indexing; do not silently switch embedding services.
