# Cloudflare delivery

## Purpose

Deploy and operate obsidi.xyz on its named Cloudflare resources with verified email, isolated testing, observable failures, and documented recovery.

## ADDED Requirements

### Requirement: Named production resources

Production SHALL serve `obsidi.xyz` through Worker `obsidi`, retaining `https://obsidi.tirlabs.workers.dev/` as a documented deployment endpoint. It SHALL bind the existing `obsidi-xyz` D1 database and private R2 bucket without replacing or recreating them.

#### Scenario: Resource binding review

- **WHEN** production deployment is prepared
- **THEN** configuration references verified resource IDs and names
- **AND** no database or bucket is recreated because a local binding is missing.

### Requirement: Transactional email sender

The service SHALL onboard and verify `e.obsidi.xyz` for Cloudflare Email Sending and send verification/recovery/security messages from a documented sender on that domain. DNS setup MUST preserve unrelated mail records; outgoing content MUST include text and HTML alternatives.

#### Scenario: Sender verification

- **WHEN** email setup completes
- **THEN** the sending subdomain's required SPF, DKIM, bounce, and DMARC configuration is verified
- **AND** a test to an explicitly approved real recipient demonstrates delivery
- **AND** configuration success alone is not reported as inbox-delivery proof.

### Requirement: Least-privilege runtime configuration

Runtime service credentials MUST be secrets, never frontend variables or committed files. Readiness checks SHALL distinguish absent credentials, insufficient permissions, unverified domains, unpaid service requirements, and unreachable upstreams.

#### Scenario: Missing analytics read permission

- **WHEN** the configured analytics credential cannot query usage
- **THEN** readiness reports that specific failure
- **AND** dashboards do not substitute fabricated data or expose the credential.

### Requirement: Isolated validation environments

Automated tests and previews MUST NOT send production email, create live charges, mutate customer notebooks, or bind production persistence by default. Local tests SHALL exercise Workers-compatible storage/authentication behavior.

#### Scenario: Preview deployment

- **WHEN** a preview is built
- **THEN** billing uses test-mode credentials and data resources are local or explicitly isolated
- **AND** production mutations require a deliberate separately authorized workflow.

### Requirement: Verified deployment gates

Production deployment MUST require passing formatting, type, unit, integration, build, security-isolation, accessibility, and browser checks plus strict OpenSpec validation. Missing required external end-to-end proof MUST be marked blocked, not complete.

#### Scenario: External integration unverified

- **WHEN** code checks pass but email, Stripe, Infrastructure, or MCP acceptance remains unverified
- **THEN** the release record identifies the missing proof
- **AND** no full-production-readiness claim is made.

### Requirement: Observable and recoverable operations

Operators SHALL have redacted request/error logs, health/readiness endpoints, migration and reconciliation procedures, usage-export replay guidance, and rollback instructions. Database changes MUST be additive or carry a reviewed preservation and rollback plan.

#### Scenario: Worker rollback

- **WHEN** an application deployment is rolled back
- **THEN** the runbook explains that object writes, database migrations, invoices, and DNS changes are not automatically reverted
- **AND** compatible schema and active publication pointers preserve customer access.
