# Proposal

## Why

obsidi.xyz will let people host Obsidian vaults, deliberately publish notes, and understand their storage and public traffic without operating their own infrastructure. The repository currently contains only a README and Apache license; the product needs an explicit design, tenant-isolation contract, and verifiable delivery plan before implementation.

## What Changes

- Create a screenshot-grounded dark UI system using JetBrains Mono v2.304 and at least 15 actual shadcn/ui component types.
- Build an Astro application on Cloudflare Workers with authenticated server islands and narrowly hydrated React interactions.
- Provide UUID-based Better Auth accounts backed by D1, email verification, password recovery, Turnstile, and account security.
- Support private vault ingestion, preview, selective public publishing, public reading/search, unpublishing, export, and deletion.
- Configure the existing `obsidi-xyz` R2 bucket for private multitenant storage and bind the existing `obsidi-xyz` D1 database.
- Provide user-scoped storage, public page-view, API-call, and MCP-tool-call usage reporting; distinguish approximate analytics from exact accounting.
- Integrate Stripe's Node SDK and Better Auth Stripe plugin for subscriptions, portal access, signed webhooks, and idempotent usage export.
- Provide self-service API keys tied to the account UUID and a remote MCP server using Better Auth Agent Auth with explicit capability grants.
- Configure Cloudflare transactional sending for `e.obsidi.xyz` and integrate Better Auth Infrastructure Dashboard, audit logs, and Sentinel.
- Deliver tested milestones, operator runbooks, explicit deployment gates, and commit/push each verified increment on `sandbox`.

## Capabilities

### New Capabilities

- `interface-system`: Screenshot analysis, design tokens, shadcn mapping, responsive screens, accessible states, and font provenance.
- `identity-security`: UUID accounts, D1-backed sessions, verified email, Turnstile, authorization, and isolation.
- `vault-publishing`: Safe ingestion, note/asset handling, selective publishing, public reader, search, export, and deletion.
- `tenant-storage`: Private R2 configuration, object namespaces, storage reservations, reconciliation, and cleanup.
- `usage-analytics`: Tenant-filtered Analytics Engine queries, metric definitions, exact ledger, and quota enforcement.
- `subscriptions-billing`: Stripe customer mapping, subscriptions, usage export, webhook handling, and billing controls.
- `developer-access`: Account-owned API keys, permission checks, Agent Auth approval UI, and scoped MCP transport.
- `operator-security`: Better Auth Infrastructure dashboard, audit events, Sentinel integration, and admin authorization.
- `cloudflare-delivery`: Workers deployment, D1 migrations, email sender setup, environments, observability, and recovery.

### Modified Capabilities

None. No existing OpenSpec specifications or application code were present.

## Impact

- New Astro/TypeScript/React frontend, shadcn source components, Tailwind styling, server handlers, database schema/migrations, tests, and build tooling.
- Existing production resources: Worker `obsidi`, domain `obsidi.xyz`, R2 bucket `obsidi-xyz`, D1 database `obsidi-xyz`, and email subdomain `e.obsidi.xyz`.
- External dependencies: Better Auth and its requested plugins, Stripe, Cloudflare Workers/R2/D1/Analytics Engine/Email Sending/Turnstile.
- Decisions requiring owner approval: initial ingestion workflow, pricing/currency/quotas and overage policy, retention, and any paid-service activation. The design states proposals rather than treating unspecified choices as approved.
- No existing customer data will be overwritten, published, expired, or migrated by the planning milestone.
