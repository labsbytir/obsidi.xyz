# obsidi.xyz Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` for native execution or `subagent-driven-development` if the owner chooses delegation. Follow this plan task-by-task; OpenSpec remains the implementation progress source of truth.

**Goal:** Deliver the complete approved Obsidian-vault hosting SaaS with verified isolation, publishing, usage, subscriptions, developer access, and operations.

**Architecture:** One Astro Cloudflare Worker serves public HTML and authenticated server islands. React/shadcn provides interactive controls, D1 stores identity and durable accounting, and private R2 stores immutable notebook revisions/releases. Analytics Engine is observational; Stripe and Better Auth Infrastructure are externally verified integrations.

**Tech Stack:** TypeScript, Astro, React, shadcn/ui, Tailwind, Cloudflare Workers/R2/D1/Analytics Engine/Email Sending/Turnstile, Better Auth and requested plugins, Stripe, Vitest/Workers integration tests, Playwright.

**Spec:** `openspec/changes/build-obsidi-saas/design.md` and every `specs/*/spec.md` beneath this change.

**Plan state:** Design approved. Implementation not started. Plan review and execution-method selection pending.

## Global Constraints

- Work only inside this repository; never stage the parent `/Users/pen` repository.
- Commit verified task-owned changes on `sandbox`, reference `build-obsidi-saas`, and push after each verified code increment. No force-push, task PR, or production-branch mutation.
- Before each implementation unit, read the relevant specification and tests; run its new test red, implement minimally, then run it green.
- Use TypeScript application/configuration code; Astro markup and CSS are required frontend syntax. Do not introduce another general-purpose language.
- Use Astro server islands and actual shadcn components; prove at least 15 distinct component types in reachable functional product screens.
- Self-host JetBrains Mono v2.304 with its official license; no floating CDN font substitution.
- Use `cf` for resource operations and Wrangler for this Workers application, as requested by the owner.
- Existing production D1 and R2 are both `obsidi-xyz`; never recreate them or mutate customer data during tests.
- Every user ID is a server-generated UUID; ownership comes only from verified server-side identity.
- Private dashboard/API/island responses are `private, no-store`; the bucket has no public endpoint.
- Initial ingestion: ZIP, maximum 20 MiB compressed / 100 MiB expanded / 2,000 entries / 10 MiB per file / path depth 32; prove runtime feasibility.
- Initial attachments: PNG, JPEG, GIF, WebP, plain text. No executable Obsidian plugins, HTML, SVG, or server-fetched remote embeds.
- Account identity controls original files, release objects, page-view attribution, billing references, API keys, and agent grants.
- Storage/API/MCP quotas and billable operations use durable atomic accounting; Analytics Engine totals are explicitly estimated.
- Live checkout, rates, paid subscriptions/enrollment, and destructive expiration remain blocked pending separate owner approval.
- Missing external integration proof is an unchecked task and a release blocker, not a reason to invent values or mark a feature done.

## Review Focus

1. Unicode/case/path-normalization collisions: reject duplicate normalized archive entries, keep deterministic links, and never cross tenant prefixes. Tests belong to task 5.
2. Deleted/unpublished content requested through old asset/search URLs: fresh requests must fail even when internal caches contain old immutable data. Tests belong to task 6.
3. Identical idempotency key with a different payload or another owner: reject mismatch, isolate keys by owner, and never double-consume quota. Tests belong to tasks 4 and 7.
4. A returning user changes email, device, or network: retain UUID ownership and verify reset/Sentinel challenge behavior without accidental operator elevation. Tests belong to tasks 3 and 12.
5. A timeout after an external service accepted a write: reconcile stable operation/export identities and retry without duplicate subscriptions, charges, grants, or cleanup. Tests belong to tasks 8, 10, and 13.

## File Map

This map specifies intended responsibility, not permission to generate unused placeholders.

- `package.json`, lockfile, `astro.config.ts`, `tsconfig.json`, `wrangler.jsonc`: pinned runtime/build/bindings.
- `vitest.config.ts`, `playwright.config.ts`, `tests/`: focused tests and Workers/browser fixtures.
- `.husky/pre-commit`, lint-staged/Prettier configuration, `.github/workflows/checks.yml`: required local/CI gates.
- `src/styles/global.css`, `src/layouts/{Marketing,Dashboard,Reader}.astro`: shared tokens and screen shells.
- `src/components/ui/`: used generated shadcn source, one consistent component family.
- `src/components/islands/`: independently authorized Astro server-defer panels.
- `src/components/{auth,vaults,usage,billing,keys,agents}/`: focused interactive product surfaces.
- `src/lib/auth/{server,client,identity}.ts`: Better Auth factory, matching client plugins, shared identity boundary.
- `src/db/{schema,index}.ts`, `drizzle/`: generated compatible schema and additive migrations.
- `src/lib/storage/{objects,reservations,reconcile}.ts`: private object operations and accounting.
- `src/lib/vaults/{archive,markdown,repository,publishing,export}.ts`: notebook domain behavior.
- `src/lib/usage/{events,queries,ledger}.ts`: event contract, bounded query templates, exact accounting.
- `src/lib/billing/{catalog,stripe,exports}.ts`: approved catalog, SDK construction, usage export state.
- `src/lib/agents/{server,capabilities}.ts`: real MCP transport and constrained Agent Auth operations.
- `src/lib/email/messages.ts`, `src/lib/operations/{audit,readiness,cleanup}.ts`: transactional templates and operations.
- `src/pages/`, `src/middleware.ts`, `src/worker.ts` only if custom handlers are needed: application endpoints and scheduling.
- `docs/operations/`, `docs/ui-system.md`, `docs/developer-api.md`: runnable operator and product guidance.
- `public/fonts/`: pinned WOFF2 assets and license.

## 1. Runtime, test harness, and repository guardrails

**Files:** Create `package.json`, lockfile, `astro.config.ts`, `tsconfig.json`, `wrangler.jsonc`, `vitest.config.ts`, `playwright.config.ts`, `tests/runtime.test.ts`, `.gitignore`, pre-commit/format configuration, `.github/workflows/checks.yml`, and `docs/operations/development.md`. Run requested Gadget initialization only after inspecting its generated changes; preserve Ollama embedding configuration and record index unavailability rather than silently switching providers.

**Interfaces:** Produce commands `npm run check`, `npm run format:check`, `npm test`, `npm run test:workers`, `npm run test:e2e`, `npm run build`, `npm run deploy:preview`; all test/preview persistence defaults to local or isolated resources. `npm run verify` composes the non-browser code gates and strict OpenSpec validation. Production deploy must be a deliberate separate command.

- [ ] 1.1 Inspect current package availability and Cloudflare/Astro guidance, initialize only required tooling, and verify pinned installation succeeds without native SQLite or unrelated dependencies.
- [ ] 1.2 Add `tests/runtime.test.ts` asserting the local health response is 200, required bindings are typed, and the test environment cannot resolve production persistence; run `npm test -- tests/runtime.test.ts` and record the initial failure.
- [ ] 1.3 Implement the minimal Astro Workers health route and isolated runtime configuration; make `npm test -- tests/runtime.test.ts`, `npm run test:workers`, and `npm run build` pass.
- [ ] 1.4 Use the required pre-commit setup, document exact local/test commands, and verify hooks, CI configuration, formatting, type checks, and `openspec validate build-obsidi-saas --strict --no-interactive` pass.
- [ ] 1.5 Review only this task's diff, update this checklist truthfully, commit with `chore: establish Workers runtime (build-obsidi-saas)`, and verify `git push -u origin sandbox` succeeds.

## 2. Original visual system and functional screen shells

**Files:** Create `src/styles/global.css`, three layouts from the File Map, landing/sample/docs pages, `src/components/ui/` used primitives, `public/fonts/`, `docs/ui-system.md`, `tests/ui-system.test.ts`, and `tests/e2e/navigation.spec.ts`.

**Interfaces:** Produce shared tokens from design section 3 and `Marketing.astro`, `Dashboard.astro`, `Reader.astro` layouts accepting a page title and content slot. Dashboard links match design section 5. Public sample content is explicitly a sample, never a customer statistic.

- [ ] 2.1 Write UI-system assertions for exact font release/provenance, bracketed navigation, no production fixture metrics, and menu focus/close behavior; run the focused tests and record failure before adding the screens.
- [ ] 2.2 Download official v2.304 font assets/license, inspect metadata, install a consistent shadcn family, and implement tokens plus responsive shells and a truthful landing/sample reader; verify font/network and token tests pass.
- [ ] 2.3 Implement keyboard/mobile navigation using Sidebar, Sheet, Navigation Menu, Button, Separator, Kbd, Command/Dialog, and accessible focus; verify `npm run test:e2e -- navigation.spec.ts` at 360/768/1440 widths and reduced motion.
- [ ] 2.4 Move the approved screenshot descriptions and component mapping into the maintained `docs/ui-system.md` with exact implemented file paths as components land; verify no page-level overflow and manually measure actual contrast pairs.
- [ ] 2.5 Run `npm run verify`, the navigation browser checks, and diff review; record evidence, commit `feat: add notebook interface system (build-obsidi-saas)`, and push `origin sandbox`.

## 3. D1 identity, verification, recovery, and Turnstile

**Files:** Create `src/lib/auth/{server,client,identity}.ts`, `src/db/{index,schema}.ts`, generated migrations, `src/middleware.ts`, auth routes/pages/components, email templates, `tests/auth.test.ts`, `tests/workers/auth.integration.test.ts`, and `docs/operations/authentication.md`.

**Interfaces:** `createAuth(env: Env)` returns the installed Better Auth instance; `requireUser(request: Request, env: Env): Promise<{id: string; email: string; emailVerified: boolean}>` rejects missing/banned identity. Auth plugins use the D1 Drizzle SQLite adapter and a supported server-side UUID generator. `sendTransactionalEmail(env, {to, template, parameters}): Promise<{messageId: string}>` in `src/lib/email/messages.ts` uses the restricted `EMAIL` binding, with local simulation in tests; task 11 provisions its production binding. Errors retain HTTP status without leaking credentials.

- [ ] 3.1 Add failing tests for UUID stability across email/session changes, cross-site mutation denial, expired/reused verification/reset tokens, and Turnstile missing/invalid/upstream-failure rejection; run focused auth tests red.
- [ ] 3.2 Generate the installed Better Auth schema for D1 and implement the auth factory, trusted origins/cookies, verification/reset flows, and UUID identity; verify local migrations and `npm run test:workers -- auth.integration.test.ts` pass.
- [ ] 3.3 Implement usable auth forms, Turnstile widget token lifecycle, accessible retry/errors, sign-out/session revoke, and real email-template hooks; verify browser registration/sign-in/recovery using local email simulation, not production sends.
- [ ] 3.4 Add a direct-island authorization integration test, enforce verification on publishing/checkout, and document required secrets, local setup, token redaction, and operator identity separation; verify focused identity/CSRF/isolation tests.
- [ ] 3.5 Run `npm run verify` and auth browser checks; update progress, commit `feat: add UUID account authentication (build-obsidi-saas)`, and push `origin sandbox`.

## 4. Private R2 domain model and atomic storage reservations

**Files:** Create vault/revision/file/reservation/application-audit schema additions, `src/lib/storage/{objects,reservations}.ts`, `src/lib/vaults/repository.ts`, `src/lib/operations/audit.ts`, vault create/list/detail endpoints, `tests/storage.test.ts`, `tests/workers/storage.integration.test.ts`, and `docs/operations/storage.md`.

**Interfaces:** `reserveStorage(env, ownerId, operationId, bytes): Promise<Reservation>`; `finalizeStorage(env, reservationId, actualBytes): Promise<void>`; `releaseStorage(env, reservationId): Promise<void>`; `createVault(env, ownerId, {name, description?}): Promise<Vault>`; `getOwnedVault(env, ownerId, vaultId): Promise<Vault>`; `writeAudit(env, {actorId, ownerId, action, targetId, outcome, metadata?}): Promise<void>`. Define the record types in their owning modules and export only what callers need. Tests use explicit fixture quotas; missing approved production quotas block readiness rather than introducing invented commercial allowances.

- [ ] 4.1 Add failing tests for server-owned object keys, A/B tenant denial, exact replacement/deletion bytes, duplicate reservation replay, changed-payload/other-owner operation keys, and two competing uploads near quota; run the storage suite red.
- [ ] 4.2 Add additive schema/unique constraints, a minimal redacted application-audit writer, conditional D1 reservation updates, private object writes, and ownership-scoped repository operations; prove concurrent reservations cannot overconsume capacity and audit metadata omits secrets in Workers integration tests.
- [ ] 4.3 Implement create/list/detail dashboard UI with true Empty/Table/Card/Badge/Dropdown Menu states and server-island authorization; verify two isolated accounts cannot access each other's endpoints or deferred panels.
- [ ] 4.4 Inspect bucket access/custom domains/CORS/lifecycle/object inventory, retain private settings and existing seven-day multipart cleanup, and document readback evidence; verify no public endpoint, no wildcard CORS, and no newly destructive lifecycle rule.
- [ ] 4.5 Run `npm run verify` and the two-user storage browser flow; update progress, commit `feat: isolate tenant vault storage (build-obsidi-saas)`, and push `origin sandbox`.

## 5. Bounded archive ingestion and safe Obsidian rendering

**Files:** Create `src/lib/vaults/{archive,markdown}.ts`, import endpoint/UI, archive/Markdown fixtures under `tests/fixtures/`, `tests/archive.test.ts`, `tests/markdown.test.ts`, Workers import integration tests, and `docs/operations/imports.md`.

**Interfaces:** `inspectArchive(bytes: Uint8Array): Promise<ImportManifest>` enforces the design's five exact safety caps; `renderNote(source: string, context: PublishedLinkContext): RenderedNote` returns sanitized HTML, headings, and resolved owned links. Never expose a parser that evaluates MDX or user code.

- [ ] 5.1 Write red tests for traversal/absolute/symlink/encrypted entries, compressed/expanded/count/file/depth caps, Unicode/case duplicate normalized paths, `.obsidian`/dotfile exclusions, private-note link leakage, script HTML/URLs, and unsafe active assets.
- [ ] 5.2 Implement a maintained bounded ZIP reader and allowlisted Markdown/link pipeline with the exact design caps and attachment set; verify all archive/render tests and real Workers CPU/memory feasibility with maximum-size fixtures.
- [ ] 5.3 Implement reservation-backed staged import, manifest validation, immutable revision activation, progress/cancel/error UI, and ignored-file reporting; verify a failed import keeps the previous revision and reservation cleanup is retryable.
- [ ] 5.4 Document supported Obsidian syntax and safe fallbacks for aliases/headings/callouts/embeds; verify a representative notebook renders links and attachments correctly and does not expose excluded or private metadata.
- [ ] 5.5 Run `npm run verify` and import browser checks; if runtime caps are not feasible, amend/approve design before proceeding; otherwise commit `feat: import bounded Obsidian vaults (build-obsidi-saas)` and push.

## 6. Atomic selective publishing and public reader

**Files:** Create `src/lib/vaults/publishing.ts`, publication schema, publishing UI/endpoints, `src/pages/v/[slug]/[...path].astro`, public asset/search endpoints, `tests/publishing.test.ts`, `tests/e2e/reader.spec.ts`, and public-reading documentation.

**Interfaces:** `publishVault(env, ownerId, vaultId, {revisionId, noteIds, slug}): Promise<Publication>`; `unpublishVault(env, ownerId, vaultId): Promise<void>`; `getPublicNote(env, slug, path): Promise<PublicNote>` always resolves active publication/suspension state first.

- [ ] 6.1 Add failing tests for partial release failure, slug collisions, private-note/asset/search leakage, stored injection, removed notes, and old cached note/asset/search URLs after unpublish or suspension.
- [ ] 6.2 Implement release preparation and atomic active-pointer activation, explicit selected-note/asset review, and publish/unpublish confirmation with pending/error rollback; verify prior complete release survives interrupted activation.
- [ ] 6.3 Build the three-column sanitized public reader with note tree, Breadcrumb, Collapsible, Command search, heading contents, responsive Sheet controls, and code Tabs/copy; verify keyboard navigation and owned public-only search.
- [ ] 6.4 Add public-response cache controls and always-on publication checks for notes/assets/search, document inability to recall already downloaded copies, and verify a warm-cache revocation integration test.
- [ ] 6.5 Run `npm run verify`, reader browser/accessibility checks, and the two-user/public isolation matrix; commit `feat: publish selected vault notes (build-obsidi-saas)` and push.

## 7. Exact usage ledger, Analytics Engine, and dashboard

**Files:** Create `src/lib/usage/{events,queries,ledger}.ts`, usage-operation/counter schema, usage routes/islands/components, `tests/usage.test.ts`, concurrency integration tests, `tests/e2e/usage.spec.ts`, and `docs/operations/usage.md`.

**Interfaces:** `recordPublicPageView(env, {ownerId, vaultId, routeCategory}): void`; `queryUsage(env, ownerId, {vaultId?, period}): Promise<UsageReport>`; `acceptOperation(env, {ownerId, vaultId?, operationId, payloadDigest, kind}): Promise<AcceptedOperation>` performs atomic deduplication/quota acceptance. Unit kinds distinguish API operations and MCP tool invocations.

- [ ] 7.1 Add red tests for anonymous-owner attribution, assets/HEAD/prefetch/errors exclusion, sample-weighted count/byte sums, UUID/SQL-filter injection, UTC boundaries, outage-not-zero behavior, payload mismatch, and shared account quotas across keys/agents.
- [ ] 7.2 Implement fixed tenant-scoped Analytics Engine event/query schemas with server-only credentials and explicit estimated/freshness labels; verify mock upstream errors and isolated real dataset read/write when credentials permit.
- [ ] 7.3 Implement the exact D1 operation ledger and atomic period/unit counters with owner-scoped idempotency, persisted operation state, and no API/MCP double counting; prove race/retry/mismatched-payload tests under Workers.
- [ ] 7.4 Build storage/page-view/API/MCP usage UI with Select filters, Chart plus accessible table, Progress, Alert, Skeleton, and truthful empty/error states; document units, acceptance policy, sampling, freshness, and no unapproved traffic charges.
- [ ] 7.5 Run `npm run verify`, usage browser checks, and live-isolated query evidence; update progress, commit `feat: meter tenant vault usage (build-obsidi-saas)`, and push.

## 8. Stripe test-mode subscriptions and usage export

**Files:** Create `src/lib/billing/{catalog,stripe,exports}.ts`, generated Stripe plugin schema, webhook/billing routes, billing/pricing UI, `tests/billing.test.ts`, webhook integration tests, and `docs/operations/billing.md`.

**Interfaces:** `getApprovedCatalog(env): ApprovedCatalog | null`; `createStripe(env): Stripe`; `exportUsage(env, {ownerId, start, end, catalogVersion}): Promise<BillingExport>`. Auth uses the Better Auth Stripe plugin with UUID references and ownership authorization.

- [ ] 8.1 Add red tests for forged references/return URLs, missing-catalog rejection, no redirect-only entitlement, duplicate subscription prevention, raw-body signature failure, duplicate/reordered events, half-open UTC windows, and timeout-after-acceptance export retries.
- [ ] 8.2 Implement the compatible Stripe SDK/plugin, verified-email requirement, test-mode checkout/portal/subscription lifecycle, signed webhook deduplication, and state reconciliation; verify signed fixture and test-mode event flows.
- [ ] 8.3 Implement stable per-account/period/unit/catalog usage-export identities and source totals with pending/sent/reconciled state; verify retried exports do not duplicate meter events or charges.
- [ ] 8.4 Build honest billing/pricing UI for unavailable/active/past-due/pending/canceled states and document catalog/rate/rounding/tax/grace decisions still required; verify no invented live plan or destructive downgrade behavior.
- [ ] 8.5 Run `npm run verify` and Stripe test-mode browser/webhook evidence; keep live activation blocked, commit `feat: integrate test-mode subscription billing (build-obsidi-saas)`, and push.

## 9. Self-service API keys and account API

**Files:** Extend auth server/client with `@better-auth/api-key`, generated schema, `src/components/keys/`, account API handlers, `tests/api-keys.test.ts`, API contract integration tests, and `docs/developer-api.md`.

**Interfaces:** `requireApiPermission(request, env, permission): Promise<{ownerId: string; keyId: string}>`; REST domain handlers consume existing owned-vault/import/publication/usage interfaces rather than reimplementing them. Namespaces/permissions match the documented supported operations.

- [ ] 9.1 Add red tests for show-once key material, hashed storage, server-owned UUID, expiry/revocation, cross-owner list/revoke, read-only mutation denial, prohibited billing/admin/key-minting access, bounded pagination, and shared quota enforcement.
- [ ] 9.2 Implement the requested API-key plugin, creation/list/revoke/rotation UX, permission templates, expiration, safe prefix display, and redacted audit hooks; verify raw secrets do not appear in subsequent payloads or logs.
- [ ] 9.3 Expose documented authenticated REST operations using shared vault/usage behavior and exact ledger acceptance; verify API key scope cannot be elevated by client metadata or a supplied owner ID.
- [ ] 9.4 Add API setup Tabs/code examples with real request/response contracts and errors, verify copy behavior, and run all documented examples against an isolated local account.
- [ ] 9.5 Run `npm run verify` and key-management browser/API contract checks; commit `feat: add scoped account API keys (build-obsidi-saas)` and push.

## 10. Agent Auth, consent, and real remote MCP

**Files:** Create `src/lib/agents/{server,capabilities}.ts`, discovery/MCP/device routes, agent management/consent UI, generated Agent Auth schema, `tests/agents.test.ts`, real-client MCP integration tests, and MCP setup documentation.

**Interfaces:** `createMcpHandler(env)` implements supported Streamable HTTP; capabilities consume the existing owned-vault/usage domain methods. `authorizeAgent(request, env, capability, input)` resolves owner UUID and validates signature/audience/replay/grants/constraints. Exact plugin adapter calls must be verified against installed package exports.

- [ ] 10.1 Inspect and pin compatible Agent Auth/MCP packages; add red tests for missing auth, wrong audience, replay/expiry, unapproved/mismatched vault constraints, unknown capabilities, revoked grants on an open connection, malformed messages, and accepted-call timeout replay.
- [ ] 10.2 Implement the requested Agent Auth provider/discovery, delegated registration, device approval/denial UI, scoped grants, and account agent list/revoke; verify auth/consent constraints and safe client errors.
- [ ] 10.3 Implement real MCP negotiation/tools with list/read/import/publish/unpublish/usage capabilities, cancellation/unsupported-method behavior, and one exact accepted tool count without internal API double counting; verify protocol tests.
- [ ] 10.4 Exercise registration, consent, tool calls, expired/revoked access, and mutation denial with a real MCP client; document exact client/package versions and unstable-protocol constraints; retain a production gate if compatibility proof fails.
- [ ] 10.5 Run `npm run verify` and MCP integration/browser evidence, commit `feat: expose consent-scoped vault MCP (build-obsidi-saas)`, and push only verified work with incomplete external gates still unchecked.

## 11. Cloudflare email domain and production resource wiring

**Files:** Update `wrangler.jsonc`, required generated binding types, email templates/readiness checks, `docs/operations/cloudflare.md`, and nonsecret resource setup evidence/configuration.

**Interfaces:** `sendTransactionalEmail(env, {to, template, parameters}): Promise<{messageId: string}>` uses the restricted `EMAIL` binding and `noreply@e.obsidi.xyz`; public endpoints cannot use it as an arbitrary outbound relay. Resources are the verified existing D1/R2 IDs.

- [ ] 11.1 Inspect current Worker deployment/routes/bindings, zone/DNS, Email Sending availability, and account plan; record exact pre-change state and dry-run requests without exposing credentials or activating new paid enrollment.
- [ ] 11.2 Configure and verify `e.obsidi.xyz` Email Sending and required SPF/DKIM/bounce/DMARC while preserving unrelated records; if billing/enrollment approval is required, record the blocker and do not mark setup complete.
- [ ] 11.3 Bind existing D1/R2, Analytics Engine, and sender-restricted email, provision Turnstile for approved hostnames, and load necessary secrets through supported private mechanisms; verify readback and readiness without printing secrets.
- [ ] 11.4 Add failure/redaction/template tests and send one transactional test only to a real owner-approved recipient; document accepted-message versus delivered-inbox evidence and verify verification/reset links use the intended domain.
- [ ] 11.5 Run `npm run verify`, binding/local/isolated service checks, and preserve readback evidence; commit `chore: wire Cloudflare service resources (build-obsidi-saas)` and push without deploying unready production code.

## 12. Better Auth Infrastructure, audits, and Sentinel

**Files:** Extend auth server/client with `@better-auth/infra`, extend the task 4 `src/lib/operations/audit.ts`, add safe activity UI, `tests/operator-security.test.ts`, Sentinel integration tests, and `docs/operations/security.md`.

**Interfaces:** `writeAudit(env, {actorId, ownerId, action, targetId, outcome, metadata?}): Promise<void>` redacts secrets and stores application events. Provider-generated auth logs use `dash()`; no fictional separate audit plugin. Ordinary keys/customer sessions never authorize global operator endpoints.

- [ ] 12.1 Add red tests for customer/API-key access to admin routes, cross-owner audit filters, raw-credential/note-body redaction, missing Infrastructure credentials, Sentinel identification/challenge retry, changed device/network, and upstream outage behavior.
- [ ] 12.2 Implement Dashboard/dash audit integration and establish an explicitly verified operator identity through the provider; verify real user search/session revocation without granting first-user or arbitrary-email admin rights.
- [ ] 12.3 Implement Sentinel server/client modern-header integration, initially observable detection policy, challenge handling, fingerprinting disclosure, and defined failure readiness; verify no silent missing-key allow fallback is called protected.
- [ ] 12.4 Wire vault/key/grant/billing/export/operator application audit records and account-scoped history with bounded pagination; verify required events and no leakage using two accounts.
- [ ] 12.5 Run `npm run verify`, real Infrastructure dashboard/Sentinel evidence where credentials permit, document unverified blockers, commit `feat: add accountable operator security (build-obsidi-saas)`, and push.

## 13. Export, closure, reconciliation, and recoverable cleanup

**Files:** Create `src/lib/vaults/export.ts`, `src/lib/storage/reconcile.ts`, `src/lib/operations/cleanup.ts`, cleanup schema/worker scheduling if required, settings/export/deletion UI, tests for export/recovery, and `docs/operations/recovery.md`.

**Interfaces:** `exportVault(env, ownerId, vaultId): Promise<Response>` streams portable originals; `requestVaultDeletion(env, ownerId, vaultId): Promise<CleanupJob>` revokes access first; `reconcileStorage(env, cursor?): Promise<ReconciliationResult>` and `runCleanup(env, now): Promise<CleanupResult>` are bounded and retry-safe. Scheduled destructive behavior remains disabled before retention approval.

- [ ] 13.1 Add red tests for original-path portable export, cross-owner export, active-subscription closure denial, immediate public/key/grant revocation, orphan objects, partial delete failures, duplicate jobs, and timeout-after-delete replay.
- [ ] 13.2 Implement export and explicit deletion/closure UX with financial prerequisites and immediate serving/access revocation; verify original Markdown/attachments remain portable and no unrelated tenant data enters an archive.
- [ ] 13.3 Implement paginated reconciliation and durable cleanup jobs preserving reservations/active references; verify retry-safe accounting and failed cleanup visibility under injected D1/R2 faults.
- [ ] 13.4 Document proposed 24-hour staging/seven-day recovery policies and storage/billing-record exceptions; obtain owner retention approval before enabling automatic deletion, and verify no active publication prefix is expired.
- [ ] 13.5 Run `npm run verify`, export/closure browser checks, and recovery drills on isolated resources; commit `feat: add vault recovery and lifecycle controls (build-obsidi-saas)` and push.

## 14. Whole-product acceptance and operator handoff

**Files:** Complete acceptance tests under `tests/e2e/`, `docs/ui-system.md`, and `docs/operations/{release,rollback}.md`; update only required code defects and this OpenSpec change as verification reveals them.

**Interfaces:** End-to-end contracts from tasks 1–13. No new product behavior; any necessary scope/design adjustment must update the relevant specification before implementation.

- [ ] 14.1 Verify a fresh isolated account can register/verify, import, preview, selectively publish, read/search publicly, inspect real usage, create/revoke an API key, and approve/revoke MCP access; record actual evidence for each required integration.
- [ ] 14.2 Verify at least 15 distinct shadcn component types are actually imported/rendered in reachable product screens, record their exact file paths, and pass keyboard/focus/contrast/reduced-motion checks at 360/768/1440 widths with no page-level overflow.
- [ ] 14.3 Run the complete two-user and untrusted-content denial matrix, quota concurrency/retry tests, warm-cache revocation, test-mode billing webhook/export tests, and upstream-failure/recovery tests; record full command outputs and fix failures at their owning task.
- [ ] 14.4 Complete copy-pasteable release/rollback/migration/secret-rotation/usage-reconciliation runbooks and verify each safe procedure against isolated resources; explicitly state that Worker rollback does not reverse D1/R2/DNS/email/Stripe changes.
- [ ] 14.5 Run `npm run verify`, `npm run test:workers`, `npm run test:e2e`, `npm run build`, `git diff --check`, and strict OpenSpec validation, perform an independent whole-branch review under the chosen execution method, then commit/push only passing verified corrections.

## 15. Owner-gated live activation

**Files:** Approved commercial catalog, production configuration/secrets, nonsecret release evidence, and final OpenSpec progress. No code is considered production-ready merely because this group exists.

**Interfaces:** Only the approved catalog and verified production bindings/secrets may enable live behavior. Approval records are nonsecret; actual credentials remain private.

- [ ] 15.1 Obtain explicit owner approval for currency/prices/quotas/billable dimensions/overage rates/storage rounding/tax/grace/downgrade/financial retention and verify the approved version matches the displayed catalog and export calculations.
- [ ] 15.2 Obtain approval for any required paid-service enrollment, destructive retention enablement, and live Stripe activation; verify test/live credential separation and no live charges are generated as a test.
- [ ] 15.3 Confirm email delivery, real MCP client acceptance, Infrastructure Dashboard/Sentinel operation, Analytics Engine write/read, private R2/D1 bindings, and all code/browser/security gates have actual passing evidence; keep unmet items blocked.
- [ ] 15.4 Deploy the verified release only after all release gates pass; smoke-test `https://obsidi.xyz` and `https://obsidi.tirlabs.workers.dev/`, auth/canonical origins, readiness, public revocation, and redacted logs without creating unapproved charges or customer mutations.
- [ ] 15.5 Reconcile this checklist with implemented code and external proof, run strict OpenSpec validation/status, commit/push release records on `sandbox`, and report exact deployment/commit status plus any remaining explicit blockers.

## Workflow follow-up

- Archive only after owner acceptance and every requested capability has verifiable implementation or an explicitly approved scope change; never archive merely because planning artifacts are complete.
- After archive, verify all nine main capability specs have real Purpose text and preserved scenarios.
- No merge to `main`, pull request, force-push, or additional service project is implied by this plan.
