# obsidi.xyz SaaS design

**Change:** `build-obsidi-saas`

**State:** Owner approved through the “Approve obsidi.xyz design” form on 2026-11-18. Detailed implementation-plan review and execution-method selection follow. Live charging, new paid enrollment, and destructive expiration rules remain separately gated.

**Authoring date:** 2026-11-18, session-local date. Cloudflare reports resource creation timestamps on 2026-11-19 UTC.

## Context

See `proposal.md` for motivation and the nine capability specifications for normative requirements. The owner selected **Full SaaS implementation** in the delivery-scope form.

Verified current state:

- GitHub `labsbytir/obsidi.xyz` contained only `README.md` and `LICENSE`; there was no application, package manager, migration system, or OpenSpec root.
- The initially empty local folder inherited `/Users/pen`'s Git repository. The GitHub repository was cloned into the empty folder; the home repository was not modified.
- Work is on local branch `sandbox`, following current standing instructions. No production branch changes are planned.
- OpenSpec CLI is installed, its root has been initialized, and the initial capability inventory and change list were empty.
- Cloudflare CLI authenticates to **TIR LABS**, account `9061d93166998cf39e011a52b369b812`.
- D1 `obsidi-xyz` exists with ID `b57c7291-c14d-4db3-aa16-c65ba2aef3c2`, zero tables at inspection.
- R2 `obsidi-xyz` exists. Managed `r2.dev` access is disabled and there are no custom bucket domains. No CORS configuration exists. Its only inspected lifecycle rule aborts incomplete multipart uploads after seven days. Object inventory still requires inspection before configuration changes.
- `wrangler email sending settings e.obsidi.xyz` reports no configured sending subdomain. Email Sending onboarding is required; no sender was created during planning.
- Worker name and URL are owner-supplied; current deployment, routes, bindings, and custom-domain ownership still require inspection.
- The semantic repository index was unavailable because its configured Ollama provider was not configured/authenticated. No application code existed to retrieve.

## Goals / Non-Goals

**Goals**

- A usable end-to-end vault-hosting SaaS, not a visual-only mockup.
- One coherent UI across acquisition, private dashboard, public reading, and developer access.
- One server-resolved UUID ownership contract across storage, identity, usage, billing, keys, and agent grants.
- Private-by-default ingestion and explicit, revocable publishing.
- Exact quota/financial accounting separated from approximate traffic analytics.
- All requested integrations implemented and verified in milestones, with external blockers visible.

**Non-goals proposed for initial release**

- An Obsidian desktop plugin, bidirectional live sync, collaborative editing, team billing, user-supplied code/plugins, custom customer domains, AI-generated notes, or an arbitrary HTML hosting service.
- No paid products, live charges, new paid-plan enrollment, or destructive retention rules without explicit owner approval.
- No arbitrary remote fetch of note embeds or server-side execution of Obsidian plugins.

**Anti-goals**

- A public bucket containing private notebooks.
- An impressive dashboard populated by fixtures instead of real account data.
- Treating the UUID as a secret, trusting client-selected ownership, or presenting plugin installation as completed service integration.
- A single giant unverified deployment or reporting partially implemented features as complete.

## Decisions

### 1. Approach and alternatives

The owner explicitly chose the full-SaaS delivery scope over specification/infrastructure-only and frontend-only delivery.

Proposed technical approach: **one Astro Workers application, small React/shadcn islands, D1 relational metadata, private R2 objects, and Analytics Engine for observational reporting**.

- **Chosen proposal: Astro shells plus server islands.** Fits the requested platform, keeps public reading and marketing HTML-first, and isolates slow personalized panels. React is used only where shadcn interactions need it.
- **Alternative: full React SPA plus separate API Worker.** Makes the dashboard one client application but duplicates routing/session boundaries and sacrifices the requested Astro-first public rendering. Not justified for the initial release.
- **Alternative: separate publishing, billing, and MCP Workers immediately.** Offers service-level isolation but adds deployment, shared-auth, and failure coordination before a workload requires it. Keep cohesive modules in one deployment; split only with measured need.

These technical choices were proposed by the agent and accepted through the owner's design approval.

### 2. Screenshot evidence and adaptation

The three screenshots were supplied inline in the conversation. Their original binary files are not present in the repository; the following is an authored visual description, not a claim that originals were copied. Dimensions and spacing are visual estimates, not measured CSS.

#### Reference 1: `CleanShot 2026-11-18 at 10.58.22 PM@2x.png`

The 2000×1004 image is a near-black product landing page. A small hollow, squared, white mark anchors the upper-left corner; a standalone white GitHub icon sits at the far upper-right. The left rail occupies roughly one fifth of the image and lists seven links beginning with gray bracketed numbers: `[1] Docs`, `[2] Product`, `[3] Data`, `[4] Console`, `[5] Models`, `[6] Subscriptions`, `[7] Enterprise`. The navigation is muted, widely line-spaced, and monospace.

The main content starts around x=420. A very large, light-weight monospace heading, “The open source coding agent,” spans almost the full remaining width. A subdued two-line description follows with a substantial gap before the product gallery. Four tall, charcoal demonstration panels form a horizontal sequence: a desktop command surface, a terminal fragment, a dark dotted sphere for mobile, and a partially cropped SDK code sample. Panels have very little visible ornament, no colorful gradients, and strong separation through surface tone. Captions below each panel use brighter short monospace titles and softer supporting text. The fourth panel is clipped at the right edge, suggesting horizontal continuation. A small circular audio-style control floats near the lower-right corner.

**Adaptation:** use the restrained typography, bracketed rail, large negative space, and product demonstrations. Replace OpenCode branding and imagery with an original notebook mark and real obsidi.xyz previews: Vaults, Reader, Usage, API/MCP. Do not reproduce irrelevant model names, fake metrics, the dotted sphere, audio control, or horizontally clipped controls.

**shadcn mapping:** Sidebar, Navigation Menu, Button, Card, Carousel, Aspect Ratio, Separator, Tooltip.

#### Reference 2: `CleanShot 2026-11-18 at 10.58.56 PM@2x.png`

The 2000×1012 image is a documentation layout on the same near-black ground. Its upper-left cluster pairs the squared white mark with a compact `DOCS` label and downward chevron. The left rail is dense and persistent: an active `[-] Intro` entry in near-white, inactive `[ ]` entries in gray, and small uppercase group labels such as `CONFIGURE`. The main article begins near x=425 and spans roughly 1070px. The right rail begins near x=1590, with a charcoal Search control containing `⌘K`, then a small `CONTENTS` label and vertically stacked anchor links. A white vertical rule marks the active contents item.

The article hierarchy is quiet: a medium-large monospace “Intro” title, softer introductory paragraphs, then a `CLI` subheading. A thin rectangular border encloses an installation block. Its first row has compact package-manager tabs (`curl`, `homebrew`, `npm`, `bun`, `pnpm`, `yarn`, `vite+`, `aur`, `mise`) and a right-aligned Copy action. A short white underline marks the selected tab. The code region below has a slightly lighter charcoal surface and bright monospaced command text. The remaining article has generous paragraph rhythm, inline code chips, small square bullets, bold platform labels, and underlined download links. The GitHub icon repeats at upper-right.

**Adaptation:** make this the public vault reader: left note tree, central sanitized Markdown article, right heading contents and search. The same structure supports developer documentation and private note preview. At narrow widths, replace persistent rails with Sheet controls; never shrink three columns into unreadable text. Keep readable line length and intentionally larger line-height despite the all-monospace font.

**shadcn mapping:** Sidebar, Collapsible, Scroll Area, Command, Dialog, Input, Kbd, Tabs, Button, Breadcrumb, Sheet, Separator, Typography.

#### Reference 3: `CleanShot 2026-11-18 at 10.59.26 PM@2x.png`

The 2000×911 image is a console landing page. A roughly 95px top bar contains the white squared mark and `CONSOLE` label on the left; centered uppercase links for `MODELS`, `SUBSCRIPTIONS`, `TEAMS`, and `ENTERPRISE`; a dark rounded active pill on `MODELS`; and a high-contrast white `OPEN CONSOLE` button followed by GitHub on the right. A thin horizontal divider runs below the header. Vertical rules inset from both screen edges frame the content.

The hero is a broad two-column arrangement with unusually generous vertical space. On the left, a large light monospace “Access any model” heading sits above a soft-gray two-line description and a white rectangular `GET STARTED` button. On the right, a vertical stack of dark model rows recedes into shadow above and below the central rows. Each row has an icon tile, bright model title, smaller muted identifier, and a right-aligned toggle. The middle row is brighter and slightly lifted with a subtle border/shadow; a pointer hovers over its pale blue switch. The panel stack uses restrained perspective, subdued gradients within surfaces, and a deliberate center emphasis rather than bright decoration.

**Adaptation:** carry over the thin framed page grid, quiet top navigation, two-column hero, and vertically stacked actionable rows. Use vault status rows and publication switches in the dashboard, not model-provider settings. Mutating publication toggles require explicit confirmation and pending/error behavior; a decorative switch must never imply that a private vault is already public.

**shadcn mapping:** Navigation Menu, Button, Badge, Card, Switch, Tooltip, Alert Dialog, Skeleton, Dropdown Menu.

### 3. Design tokens and typography

Use original obsidi.xyz branding. Proposed mark: two offset rectangular notebook outlines with a single page notch; no copied OpenCode logo.

| Token              | Proposed value | Role                              |
| ------------------ | -------------- | --------------------------------- |
| background         | `#0b0b0b`      | Main page                         |
| foreground         | `#f4f4f2`      | Primary text                      |
| card               | `#141414`      | Quiet panels                      |
| popover            | `#1b1b1b`      | Menus and dialogs                 |
| muted              | `#202020`      | Hover/secondary surfaces          |
| muted-foreground   | `#a3a3a3`      | Readable secondary text           |
| border             | `#343434`      | Meaningful structural rules       |
| primary            | `#f4f4f2`      | White primary action              |
| primary-foreground | `#111111`      | Primary button text               |
| ring               | `#b8cbf5`      | Keyboard focus, not decoration    |
| destructive        | `#ff9b9b`      | Error/deletion text and icons     |
| success            | `#a8d5b5`      | Published/success state with text |
| warning            | `#e4c78a`      | Quota/security warnings with text |

Color values are proposed, not accessibility certification; measure every actual foreground/background pairing. Charts use muted blue/green/amber with labels and patterns/tooltips, not color-only meaning.

- Self-host JetBrains Mono **v2.304**, regular 400, medium 500, bold 700, and italic only if used. Download the pinned official release, preserve its OFL license, inspect font metadata, and do not quietly substitute a floating font CDN.
- Use CSS `font-display: swap`; preload only the regular face; disable coding ligatures in UI labels/identifiers, optionally enable in code samples.
- One font throughout, including body. Body 0.875–1rem with 1.65 line-height; reading view 1rem with 1.8 line-height; metadata 0.75rem minimum. Large hero uses fluid 2.5–5rem size and tight but readable tracking.
- Spacing base 4px; main rhythm 8/12/16/24/32/48/64/96px. Dashboard rail about 240px; reading article max 72ch; contents rail about 200px. No fixed width exceeding the viewport.
- Radius 0–4px for panels/buttons; slightly softer only for dialogs and tiny status marks. Avoid pill-heavy dashboards, glossy gradients, and excessive nested cards.
- Thin dividers where structure matters. Primary actions white; secondary actions outlined/ghost. Disabled controls retain readable labels and explanations.
- Motion subtle and optional: 120–180ms feedback; no hero animation required; respect reduced motion.

### 4. shadcn/ui inventory and screen mapping

Use the official React components from a consistently selected shadcn base family, with shared theme tokens. Do not mix incompatible component-family APIs. Pin the generated source and installed dependencies. At least 15 types must be in reachable application screens with tested behavior, not only a showcase.

| #   | Component       | Actual product placement and behavior                            | Reference            |
| --- | --------------- | ---------------------------------------------------------------- | -------------------- |
| 1   | Sidebar         | Bracket-numbered dashboard navigation and reader note tree       | 1, 2                 |
| 2   | Navigation Menu | Landing/header navigation and pricing/docs links                 | 1, 3                 |
| 3   | Button          | Import, publish, billing portal, confirmation, copy              | All                  |
| 4   | Card            | Quiet usage summaries and plan/details regions                   | 1, 3                 |
| 5   | Tabs            | Vault files/preview/settings; API/MCP setup examples             | 2                    |
| 6   | Table           | Vaults, API keys, usage/export history                           | 3 adaptation         |
| 7   | Badge           | Private/published, plan, revoked/expired state with text         | 3 adaptation         |
| 8   | Progress        | Storage allowance and import progress with numeric label         | 3 adaptation         |
| 9   | Chart           | Public page-view trend and API/MCP usage with table alternative  | Usage adaptation     |
| 10  | Select          | Reporting period and authorized vault filter                     | 2 adaptation         |
| 11  | Input           | Vault name/slug, key name, login, search                         | 2                    |
| 12  | Field           | Accessible label, description, validation/error grouping         | Forms adaptation     |
| 13  | Dialog          | Create vault/key, show-once credential, command search           | 2                    |
| 14  | Alert Dialog    | Publish exposure, unpublish, revoke, delete confirmation         | 3                    |
| 15  | Dropdown Menu   | Per-vault actions and account menu                               | 2, 3                 |
| 16  | Switch          | Publication preference with confirmation and rollback on failure | 3                    |
| 17  | Checkbox        | Explicit note selection and permission grants                    | 2 adaptation         |
| 18  | Command         | Keyboard note/navigation search with `⌘K`/`Ctrl+K`               | 2                    |
| 19  | Kbd             | Visible platform-appropriate shortcut hint                       | 2                    |
| 20  | Sheet           | Mobile navigation and contents drawer                            | 2 adaptation         |
| 21  | Skeleton        | Fixed-size server-island fallback                                | 3 adaptation         |
| 22  | Alert           | Upstream outage, quota warnings, required verification           | States adaptation    |
| 23  | Tooltip         | Explain metrics/actions without hiding essential information     | All adaptation       |
| 24  | Breadcrumb      | Dashboard/vault hierarchy and reader location                    | 2                    |
| 25  | Scroll Area     | Long file tree and overflowing menus                             | 2                    |
| 26  | Separator       | Header, navigation groups, settings sections                     | All                  |
| 27  | Avatar          | Account menu with initials fallback, no fake profile image       | Dashboard adaptation |
| 28  | Collapsible     | Folder tree and advanced key details                             | 2                    |
| 29  | Pagination      | Key/audit/history listings                                       | Dashboard adaptation |
| 30  | Empty           | No vaults, no matching notes, no keys/usage yet                  | States adaptation    |
| 31  | Textarea        | Vault description and permitted settings input                   | Forms adaptation     |
| 32  | Carousel        | Four real product previews on marketing page; no forced autoplay | 1                    |
| 33  | Aspect Ratio    | Stable product-preview dimensions                                | 1                    |

This inventory intentionally maps more than 15 candidates. The final acceptance inventory must name actual file paths and prove the required count; unused candidates are not a reason to generate unnecessary code.

### 5. Screens, routes, and information hierarchy

- `/`: framed landing shell; headline “Your notes. Your domain.”; copy about private hosting and deliberate publication; primary “Create a vault”, secondary “Read a sample”; real product previews rather than fabricated testimonials or uptime claims.
- `/pricing`: approved catalog only; before approval show a clear availability notice, not invented prices.
- `/sign-in`, `/sign-up`, `/verify-email`, `/forgot-password`, `/reset-password`: minimal forms with Turnstile and explicit errors.
- `/dashboard`: `[1] Vaults`, `[2] Usage`, `[3] API keys`, `[4] Agents`, `[5] Billing`, `[6] Settings`; visible current period and account menu.
- `/dashboard/vaults/:id`: Files / Preview / Publishing / Settings tabs; private/published status; storage; last successful release; failed-import retry.
- `/dashboard/usage`: bytes/GiB, public page views, API operations, MCP tool invocations; period/vault filters; estimation/freshness labels and accessible data alternative.
- `/dashboard/api-keys`: name, prefix, permissions, expiry, last use, revoke; creation dialog reveals a key once.
- `/dashboard/agents` and `/device/capabilities`: registered agents, requested grants, scope and expiry; explicit approve/deny/revoke.
- `/dashboard/billing`: verified plan status, catalog version/period, usage, pending changes, Stripe checkout/portal.
- `/dashboard/settings`: profile, email, active sessions, export, deletion; no cross-user administrative controls.
- `/v/:slug/[[...path]]`: public three-column reader, safe assets and search; use slug separate from private UUID.
- `/docs`: publishing/API/MCP setup documentation using the reader's typography and code-tab pattern.
- Better Auth Infrastructure remains the requested operator control plane; do not build a redundant global admin UI or confuse organization audit APIs with service-wide admin permissions.

Text sketch:

```text
obsidi.xyz      VAULTS                              [account]
----------------------------------------------------------
[1] Vaults     Your vaults                 [Import vault]
[2] Usage      Storage / Page views / API / MCP
[3] API keys   -------------------------------------------
[4] Agents     Name         State       Size       Actions
[5] Billing    garden       Published   …          […]
[6] Settings   research     Private     …          […]
```

Public reader:

```text
obsidi.xyz / garden                         [Search  ⌘K]
----------------------------------------------------------
note tree           Article title                CONTENTS
[−] Getting started Introductory paragraph        Section 1
[ ] Notes           ## Section 1                 Section 2
                    Sanitized Markdown…
```

At 360px: one content column, mobile navigation Sheet, no permanent contents rail, stacked metric summaries, internally scrolling tables.

### 6. Rendering and cache boundaries

Use TypeScript application/configuration code, Astro templates, and CSS as required frontend syntax. Add `@astrojs/cloudflare` and `@astrojs/react` after design approval. Use the current compatible Astro/adapter versions verified at installation, not stale examples. Follow the owner's choice of Wrangler for Workers and `cf` for resource actions.

- Public marketing/documentation shell can be prerendered. Personalized account badge or CTA can use `server:defer`.
- Authenticated dashboard pages are on-demand and authenticate in middleware. Vault list, usage panels, and subscription summary are independent Astro `server:defer` components with Skeleton fallbacks. They each resolve and authorize the session again.
- Hydrate shadcn React interactions only where needed. A server island is not a React client island; use Astro wrapper components for defer boundaries and React children for interaction.
- Every private island/API/dashboard response: `Cache-Control: private, no-store`. No global mutable user state, credentials in props, or shared-cache personalized responses.
- Public reader requests resolve current publication/suspension state before reading an immutable rendered object. Start with browser `no-store` for reader content/search/assets to make revocation dependable. Cache immutable data internally only behind the current publication check.
- Keep server-island props minimal and non-authoritative. The original page URL is not the island request URL; pass validated resource identifiers and reauthorize. Do not trust `Referer` as an identity boundary.
- Use a stable secret `ASTRO_KEY` across builds if cached shells survive deployment; generate and manage it as a secret, never document its value.

### 7. Identity and data model

Use Better Auth with Drizzle's SQLite adapter over the D1 driver. Native `better-sqlite3`, Bun SQLite, and a filesystem SQLite database are not the deployed D1 implementation.

Generate the auth/plugin schema from the installed versions; verify every generated migration locally against Workers before remote application. Set Better Auth user-ID generation to server-side UUIDs using the installed supported API. Do not rewrite plugin tables by guessing their columns.

Application records:

- `vault`: UUID, `ownerId` foreign key, name/description, public slug, lifecycle status, current private revision, active public release.
- `revision`: UUID, vault/owner IDs, import state, manifest key, logical bytes, entry count, checksum, timestamps.
- `file`: owner/vault/revision IDs, normalized relative path, server-owned object key, size, digest, media type, publication eligibility.
- `publication`: immutable release UUID, selected note/asset manifest, title, revision, activation state/time. Active pointer changes only after all objects validate.
- `storage_reservation`: owner, unique operation, reserved bytes, expiry, state.
- `usage_operation`: unique logical operation ID, owner/vault, kind, payload digest, state/result reference, UTC period and timestamps.
- `usage_counter`: owner + period + unit, atomically updated totals; reservations and operation deduplication in the same transaction/batch.
- `billing_export`: owner, UTC half-open period, catalog version, source totals/checksum, Stripe export identity, pending/sent/reconciled state.
- `webhook_receipt`: event ID, type, received/processed state; no full sensitive payload unless justified.
- `app_audit`: actor/owner UUID, target ID, action, outcome, UTC time, safe metadata.
- `cleanup_job`: object prefix/manifest, reason, earliest-delete time, cursor and retry state.

Account/period/owner foreign-key relationships and unique constraints prevent cross-user references. All private lookups include ownership. Account closure revokes grants before cleanup; financial records use the approved retention schedule.

D1 is the initial durable exact ledger. Atomic SQL conditional updates/batches, unique operation IDs, and reservations must be proven under concurrency. If measured write contention exceeds this design, propose a per-account coordinator separately; do not silently add infrastructure or weaken exactness.

### 8. Ingestion and publication proposal

**Approved initial workflow:** browser import is a ZIP of Markdown and supported passive attachments. No automatic desktop sync. Updating a vault uploads another archive and creates a new immutable revision.

Proposed initial safety caps, subject to runtime tests: 20 MiB compressed, 100 MiB expanded, 2,000 entries, 10 MiB per file, path depth 32. Enforce both declared and actual streamed counts. The technical safety caps are not commercial plan allowances. A paid plan cannot exceed a technical cap without another tested ingestion path.

Use one maintained archive parser with explicit expanded-byte/entry bounds rather than writing a ZIP parser. If those caps cannot fit Workers CPU/memory in measured tests, stop and amend the design to staged per-file upload rather than claiming arbitrary-size ZIP support.

Exclude `.obsidian/`, dotfiles, OS metadata, symlinks, executable formats, HTML, SVG, and unsupported active documents. Initial supported attachments: PNG, JPEG, GIF, WebP, and plain text. Markdown parsing never executes MDX or embedded JavaScript. Preserve original Markdown in private storage; sanitize rendered HTML with a maintained allowlist pipeline and resolve links without cross-vault leakage.

The import UI reports exclusions and validates a manifest before activation. User explicitly selects publishable notes. Referenced safe assets are shown in the publication preview; external embeds are links, not server-fetched resources. Initial Markdown features cover the scoped reading semantics; unsupported plugin syntax is shown safely and documented.

### 9. R2 configuration and storage accounting

Keep bucket `obsidi-xyz` private, no public custom bucket domain. Serve public notes through Worker publication checks. Same-origin application uploads need no bucket CORS policy; do not add permissive `*` CORS merely because this is SaaS.

Object layout:

```text
tenants/{ownerUuid}/vaults/{vaultUuid}/revisions/{revisionUuid}/objects/{fileUuid}
tenants/{ownerUuid}/vaults/{vaultUuid}/releases/{releaseUuid}/objects/{fileUuid}
staging/{ownerUuid}/{operationUuid}/…
```

Paths are metadata in versioned manifests. IDs and prefixes are server-owned; no client-controlled arbitrary object key.

- Before writes, reserve capacity atomically. Finalize using actual size. Reject over-reservation data; release abandoned reservations.
- Logical active vault bytes are the customer storage measure. Show physical staging, previous revisions, and rendered releases separately to operators. No unapproved double billing.
- Retain the existing seven-day multipart-abort rule. Initially add no live-data expiration rule.
- Proposed recovery policy: replaced private revisions retained seven days; failed staging bounded to 24 hours; explicit vault/account deletion revokes serving immediately and schedules recoverable cleanup for seven days. Final retention and exceptions require owner approval. A cleanup worker/cron reconciles D1 state before deleting; bucket-wide blind deletion is forbidden.
- R2 and D1 do not share a transaction. Use staged writes plus activation pointers and durable cleanup jobs; retry/reconcile orphan objects. Record and surface failures.
- Inspect any existing objects/custom domains before configuration. Never replace a lifecycle configuration with a guessed empty baseline.

### 10. Metrics, analytics, quotas, and privacy

Analytics Engine dataset proposed: `obsidi_usage`, binding `USAGE`. Owner UUID is `index1`, with vault ID, event kind, safe route category, and outcome in documented blob slots. Numeric fields carry bytes/duration/count as appropriate. Version the event schema; never send note bodies or credentials.

- **Public page views:** successful top-level public HTML requests including a reload. Exclude assets, HEAD, known prefetches, previews, errors, health checks. Do not claim unique-human visits or perfect bot filtering. Attribute by the publication record even for anonymous visitors and cache hits.
- **Storage:** exact current logical hosted bytes plus separately labeled physical overhead/recovery copies.
- **API operations:** accepted authenticated logical external API operations. A duplicate idempotency key returns the original state, rejects mismatched payloads, and is not charged twice. Denied calls go to security metrics, not a successful-operation counter.
- **MCP requests:** display the label “MCP tool invocations” with a documented definition. Each accepted tool invocation counts once; initialize/list/ping do not consume tool allowance. Internal tool-to-domain calls do not additionally consume API allowance.
- Mutation failures after durable acceptance remain one accepted operation; errors before acceptance consume no allowance. Disclose this acceptance-based policy before billing.

Analytics queries run server-side against the Cloudflare SQL API with `ANALYTICS_API_TOKEN`, account ID, fixed SQL templates, validated UUIDs, authorized vault filters, and allowlisted periods. Use `SUM(_sample_interval)` for event count estimates and weight numeric sums correctly. Give each owner independent indexed sampling. Never accept browser-supplied SQL.

Dashboard defaults proposed: last 30 UTC days, selectable 24 hours/7 days/30 days/current billing period, maximum query range 90 days subject to verified service retention. Mark estimated counts and last successful query time. Error is not zero; render explicit unavailable/stale state.

Financial charges and hard quotas come from D1, not sampled Analytics Engine. Page views are measured but **not charged** until an approved policy and accounting source exist. Metering is implemented for all four requested dimensions; which become paid overages is a commercial approval, not an inferred requirement.

### 11. Stripe and commercial launch gate

Use `stripe` plus `@better-auth/stripe`, with the installed versions' compatible API version, Workers fetch transport, and async Web Crypto webhook verification. `referenceId` is the account UUID and `authorizeReference` enforces ownership for every action.

Use provider checkout and billing portal instead of handling card data. Require email verification before checkout. Validate same-site return paths. Existing subscribers supply their active subscription ID during upgrades.

Webhook route: `/api/auth/stripe/webhook`. Verify the raw body before parsing; record event IDs, deduplicate side effects, and reconcile subscription state when out-of-order events arrive. Checkout redirects alone never grant entitlements. Test failure, cancellation, renewal, downgrade, and retry cases.

Usage exports use stable per-account/period/unit/catalog identifiers, UTC `[start,end)` windows, persisted source totals, and retry-safe Stripe meter-event identifiers. Protect against accidental production-mode keys in preview.

**Owner decisions required before enabling live billing:** currency, plan names and recurring amounts, included quotas, billable dimensions and overage rates, storage integration/rounding, taxes, grace period, cancellation/downgrade handling, and invoice/financial retention. Implement the approved-catalog structure and test-mode flow first; missing catalog means no live checkout. Do not create paid Stripe products or activate paid Cloudflare/Infrastructure subscriptions without approval.

### 12. API keys and remote MCP

Use `@better-auth/api-key` with user references, hashed storage, server-only permissions, expiration, prefix `obsidi_`, and create-once raw-key display. Session-authenticated users manage their own keys. Do not turn API keys into unrestricted dashboard sessions.

Initial application REST routes: account-scoped vault list/create/detail/import/export, publication activate/revoke, and usage read. Domain operations are shared directly with MCP handlers to avoid loopback HTTP or double metering. Validate all request inputs and bounded pagination.

Use the requested `@better-auth/agent-auth`, pinned to a verified compatible release. Expose `/.well-known/agent-configuration`, device approval at `/device/capabilities`, and an MCP endpoint `/mcp` with the supported Streamable HTTP transport.

Initial proposed capabilities: `vaults.list`, `notes.read`, `vaults.import`, `vaults.publish`, `vaults.unpublish`, `usage.read`. Omit destructive account/billing/key-minting capabilities. Grant constraints include owned vault IDs and expiry. Mutating capabilities require explicit consent. Only delegated owner mode initially; autonomous ownership is not inferred.

Use the plugin's documented MCP adapter plus a real MCP server/transport, not an assumption that the auth plugin supplies all transport/tool behavior. Verify exact integration APIs against installed package exports. Every invocation resolves user UUID and rechecks grants/revocation, JWT audience/expiry/replay, and constraints.

The upstream protocol is explicitly unstable. Production enablement requires real-client registration, consent, tools, malicious-scope, replay, and revocation proof. Compatibility failure blocks this milestone; it does not silently replace requested Agent Auth with unrelated bearer authentication.

### 13. Operator control plane and Sentinel

Install `@better-auth/infra` compatible with the pinned Better Auth release. Configure `dash()` and its existing automatic auth audit events; audit logs are not a separate fictional plugin. Add redacted application audit events for domain operations.

Operator management uses Better Auth Infrastructure's verified dashboard/admin control plane. Ordinary customer sessions and account keys do not become global administrators. Owner operator identity must be explicitly established, not inferred from the first registered email.

Integrate `sentinel()` plus `sentinelClient()` with matching modern-header settings, identification and proof-of-work challenge handling. Start with observable/logging detection policy as recommended by the provider, while retaining Turnstile and core endpoint limits. Fingerprinting/security telemetry must be disclosed. Blocking rules require review of false positives.

Missing `BETTER_AUTH_API_KEY` blocks production readiness; do not accept the documented potential allow-mode fallback as an active security implementation. Define and test upstream outage behavior before turning protection on. No new paid subscription is silently provisioned.

### 14. Email, bindings, and service prerequisites

Proposed sender: **`obsidi.xyz <noreply@e.obsidi.xyz>`**. This is an outbound identity, not an invented inbound mailbox. No reply-to mailbox is configured unless the owner supplies one.

Onboard `e.obsidi.xyz` as its own Cloudflare Email Sending domain inside zone `obsidi.xyz`. Inspect DNS before mutation and preserve existing SPF/DMARC and unrelated mail. Verify required bounce MX, SPF, DKIM, and DMARC records using current service guidance. Restrict the Worker email binding to the intended sender where supported.

Cloudflare documentation says arbitrary-recipient sending requires Workers Paid. Check actual account/service availability; report any enrollment/charge approval needed. Do not confuse inbound Email Routing with transactional Email Sending.

Production bindings/secrets to verify:

| Name                        | Kind                             | Purpose                           |
| --------------------------- | -------------------------------- | --------------------------------- |
| `DB`                        | D1 binding                       | Existing `obsidi-xyz`             |
| `VAULTS`                    | R2 binding                       | Existing private `obsidi-xyz`     |
| `USAGE`                     | Analytics Engine binding         | Dataset `obsidi_usage`            |
| `EMAIL`                     | Email Sending binding            | Verified outbound domain/sender   |
| `APP_URL`                   | Nonsecret variable               | `https://obsidi.xyz`              |
| `CLOUDFLARE_ACCOUNT_ID`     | Nonsecret variable               | Verified account                  |
| `PUBLIC_TURNSTILE_SITE_KEY` | Public variable                  | Browser widget                    |
| `BETTER_AUTH_SECRET`        | Secret                           | Session/token cryptography        |
| `ASTRO_KEY`                 | Build/runtime secret as required | Stable island-prop encryption     |
| `TURNSTILE_SECRET_KEY`      | Secret                           | Server captcha verification       |
| `ANALYTICS_API_TOKEN`       | Secret                           | Server-side SQL read              |
| `STRIPE_SECRET_KEY`         | Secret                           | Test/live explicitly separated    |
| `STRIPE_WEBHOOK_SECRET`     | Secret                           | Signature verification            |
| `BETTER_AUTH_API_KEY`       | Secret                           | Infrastructure Dashboard/Sentinel |
| Agent signing material      | Secret/provider-managed          | Per verified Agent Auth version   |

Existing injected credentials may be reused after checking scope without printing values. Ask for missing secrets only through the private secret card. Never copy a general account token into frontend configuration.

### 15. Module and test boundaries

Proposed layout: `src/components/ui/` for used shadcn source; `src/components/islands/` for Astro wrappers; `src/layouts/`; `src/pages/`; `src/lib/auth/`, `vaults/`, `storage/`, `usage/`, `billing/`, `agents/`, `email/`; `src/db/`; `tests/`; `docs/operations/`. Avoid generic service wrappers or duplicate tenant-check frameworks.

Each nontrivial behavior has a failing regression/acceptance test before implementation. Tests include:

- UUID creation; verification/reset token reuse; Turnstile failure; CSRF and direct-island requests.
- Two-user denial matrix for vault/files/search/usage/keys/agents/billing/audit.
- Zip traversal/bomb/duplicate entries; unsupported attachments; HTML/URL injection; wikilink/private-note leakage.
- Atomic publication, failed import, unpublish and cached content/asset/search denial.
- R2/D1 partial failure, concurrent reservations, exact replacement/deletion totals, cleanup retry.
- Sample-weighted queries, validated filters, analytics outage, UTC boundaries, idempotent API/MCP accounting.
- Signed/replayed/reordered Stripe events, duplicate checkout prevention, usage export retry, missing-catalog gate.
- Agent real-client consent and calls, malformed messages, replay/audience, constraints, revocation during connection.
- Keyboard dialogs/menus/search, readable focus and contrast, reduced motion, 360/768/1440 layouts, truthful loading/error states.

Local Workers integration tests use D1/R2 simulations or isolated resources, never production customer data. Browser acceptance uses a real local/preview build with deterministic fixture accounts only in tests. Production screenshots must not contain mock customer metrics.

## Risks / Trade-offs

- **Unapproved pricing/retention:** implementation can provide test-mode behavior, but live charging and data expiration remain blocked until owner decisions.
- **Archive runtime constraints:** enforce small bounded imports and benchmark before promising larger vaults; amend design if the Workers runtime cannot support the proposal.
- **Unstable Agent Auth:** pin versions, prove full client flow, and keep production MCP gated until verification.
- **D1/R2 non-transactionality:** immutable revisions, active pointers, reservations, and retryable cleanup preserve consistency.
- **All-monospace body copy:** larger line-height, capped article width, and measured mobile readability compensate for density.
- **Telemetry sampling/retention:** disclose estimates/freshness and use exact D1 accounting for financial decisions.
- **Same-origin untrusted content:** strip active formats and sanitize Markdown, enforce CSP, never host arbitrary HTML/SVG in the authenticated origin.
- **Third-party identity/security services:** explicit secrets, plan availability, data-processing disclosure, timeouts, and tested outage policy.
- **Production resource mutation:** inspect first, use CLI dry-runs, preserve existing configuration, and record readback evidence.

## Migration Plan

1. Approve this design and its initial-release proposals; record any corrections in this change.
2. Create detailed implementation tasks using OpenSpec as the source of truth. Keep every unbuilt feature unchecked.
3. Establish package/build/test/pre-commit tooling, original design tokens, pinned self-hosted font, and actual used UI primitives.
4. Deliver local Workers-compatible identity/storage/publishing end to end before adding financial or agent complexity.
5. Add real usage, exact limits, Stripe test mode, keys/MCP, and Infrastructure integrations in verified commits.
6. Inspect and configure existing Cloudflare resources; use additive D1 migrations; create isolated preview persistence and Stripe test credentials.
7. Verify browser/accessibility/isolation and all required external integrations. Obtain separate approval for commercial catalog, paid enrollment, expiration policy, and live charges.
8. Deploy only after readiness gates pass. Verify both domain and supplied Workers endpoint. Commit and push each verified milestone to `sandbox` without force.

Rollback: preserve prior Worker version and additive schema compatibility; restore active publication pointers rather than deleting revisions. Worker rollback does not undo D1/R2 changes, emails, invoices, DNS, or external grants. The runbook must cover each explicitly.

## Approval checklist

- Builder review completed: the independent read-only reviewer reported “nothing important left.” This does not replace owner approval or implementation testing.
- [x] Owner approves the full design before product implementation.
- [x] Owner accepts ZIP-first ingestion, selected-note publishing, passive attachment limits, and no desktop sync in initial release.
- [x] Owner accepts outbound sender `noreply@e.obsidi.xyz`.
- [ ] Owner approves recovery/cleanup retention before scheduled deletion is enabled.
- [ ] Owner supplies/approves pricing and quotas before live checkout or overage billing.
- [ ] Owner approves any new paid service enrollment separately.

Pricing and paid enrollment do not need invented answers to implement safe local/test-mode flows. Ingestion and publication proposals do need approval before their implementation.

## Sources checked

Retrieved during this planning session; package versions and exact APIs must be checked again when installing.

- Astro server islands: https://docs.astro.build/en/guides/server-islands/
- Astro Cloudflare adapter: https://docs.astro.build/en/guides/integrations-guide/cloudflare/
- shadcn component catalog: https://ui.shadcn.com/docs/components
- Font release: https://github.com/JetBrains/JetBrainsMono/releases/tag/v2.304
- Better Auth SQLite: https://better-auth.com/docs/adapters/sqlite
- Better Auth Drizzle: https://better-auth.com/docs/adapters/drizzle
- Stripe SDK: https://github.com/stripe/stripe-node
- Stripe plugin: https://better-auth.com/docs/plugins/stripe
- API keys: https://better-auth.com/docs/plugins/api-key
- Agent Auth and its instability warning: https://better-auth.com/docs/plugins/agent-auth
- Captcha/Turnstile: https://better-auth.com/docs/plugins/captcha
- Dashboard: https://better-auth.com/docs/infrastructure/plugins/dashboard
- Audit logs: https://better-auth.com/docs/infrastructure/plugins/audit-logs
- Sentinel: https://better-auth.com/docs/infrastructure/plugins/sentinel
- Usage billing and sampling: https://developers.cloudflare.com/analytics/analytics-engine/recipes/usage-based-billing-for-your-saas-product/
- Worker SQL queries: https://developers.cloudflare.com/analytics/analytics-engine/worker-querying/
- R2 lifecycles: https://developers.cloudflare.com/r2/buckets/object-lifecycles/
- Sending subdomains: https://developers.cloudflare.com/email-service/configuration/subdomains/
- Sending setup: https://developers.cloudflare.com/email-service/get-started/send-emails/

The screenshot descriptions are visual evidence from the owner's attachments; token values and architectural details are the proposed adaptation, not claims about the reference site's source code.
