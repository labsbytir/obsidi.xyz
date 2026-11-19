# Usage analytics

## Purpose

Show each account its notebook storage and public activity while keeping approximate traffic analytics separate from exact enforcement and financial accounting.

## ADDED Requirements

### Requirement: Defined usage units

The dashboard SHALL identify storage in bytes/GiB, public HTML page views, authenticated API operations, and MCP tool invocations as distinct units. It MUST show the reporting period, freshness, quota, and whether each number is exact or estimated.

#### Scenario: MCP request with multiple tools

- **WHEN** one MCP transport request executes two tools
- **THEN** usage records two tool invocations rather than one HTTP request
- **AND** the same tool work is not also billed as an external API operation.

### Requirement: Correct public traffic attribution

Public page-view events MUST use the published vault owner's server-resolved UUID and vault ID. Attachments, health checks, prefetches, dashboard previews, and rejected requests MUST NOT count as successful HTML page views. The UI MUST NOT call page views unique visitors.

#### Scenario: Anonymous public reader

- **WHEN** an anonymous reader successfully requests a published HTML note
- **THEN** the event is attributed to the vault owner without trusting a caller-provided UUID
- **AND** no private note body, authentication secret, or unnecessary visitor identifier enters analytics.

### Requirement: Tenant-scoped analytics queries

The application SHALL query Analytics Engine from the server using a secret credential. Every customer query MUST filter on the authenticated owner's UUID and authorized vault IDs with bounded time ranges and validated filters; browsers MUST NOT submit arbitrary SQL or receive the Cloudflare token.

#### Scenario: Forged analytics filter

- **WHEN** user A submits user B's UUID, a SQL fragment, or an unauthorized vault filter
- **THEN** the server rejects it or applies user A's authorized scope
- **AND** no cross-tenant analytics are returned.

### Requirement: Sampling-aware reports

Analytics estimates SHALL account for sample weights, expose freshness and estimation, and distinguish an empty result from an upstream failure. Missing or delayed analytics MUST NOT be treated as free capacity or a zero invoice.

#### Scenario: Analytics outage

- **WHEN** the analytics query times out or fails
- **THEN** the dashboard shows unavailable or explicitly stale data with retry
- **AND** financial exports and quota checks do not substitute zero usage.

### Requirement: Durable exact accounting

Billable operations and hard quotas MUST use durable server-side accounting with idempotent operation IDs. Retries MUST NOT charge the same logical accepted operation twice. Denied operations SHALL be counted separately for abuse monitoring and MUST follow the disclosed charging policy.

#### Scenario: Retried accepted API operation

- **WHEN** the same idempotency key and payload are retried after acceptance
- **THEN** the original result or operation state is returned
- **AND** only one billable operation is recorded
- **AND** reuse of that key with another payload is rejected.

### Requirement: Enforced account budgets

API and MCP quotas MUST aggregate across all keys and agents belonging to a UUID. Limit checks and capacity consumption MUST be atomic under concurrent requests and return actionable rate-limit responses.

#### Scenario: Multiple keys exhaust one quota

- **WHEN** simultaneous operations through different keys reach the account's remaining allowance
- **THEN** only allowed operations are accepted
- **AND** creating another key does not reset account usage.
