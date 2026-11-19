# obsidi.xyz

An Obsidian-vault hosting SaaS for private notebook storage and deliberate public publishing.

## Current status

The design and implementation plan are approved. The local Astro/Workers runtime, screenshot-grounded interface system, landing page, and interactive sample reader are implemented. Authentication and the remaining SaaS features are still in progress; nothing has been deployed by this work.

OpenSpec is the source of truth:

- [Proposal](openspec/changes/build-obsidi-saas/proposal.md)
- [Approved design, screenshot descriptions, and shadcn mappings](openspec/changes/build-obsidi-saas/design.md)
- [Implementation tasks and acceptance gates](openspec/changes/build-obsidi-saas/tasks.md)
- [Capability specifications](openspec/changes/build-obsidi-saas/specs/)

The design uses Astro server islands, shadcn/ui, JetBrains Mono v2.304, Cloudflare Workers/R2/D1, Better Auth, Stripe, and tenant-scoped usage analytics.

## Run locally

```bash
npm ci
npm run dev
```

See [development and verification](docs/operations/development.md) for isolated tests and resource boundaries.

The implemented [UI system](docs/ui-system.md) uses 18 rendered shadcn component types and self-hosted JetBrains Mono v2.304. Local pages: `/`, `/sample`, `/docs`, `/pricing`.

## Review progress

```bash
openspec show build-obsidi-saas
openspec status --change build-obsidi-saas
openspec instructions apply --change build-obsidi-saas --json
openspec validate build-obsidi-saas --strict --no-interactive
```

Planning-artifact completion is not implementation completion. Live pricing, paid-service activation, and destructive retention rules require separate approval.
