# Operator security

## Purpose

Give the service owner accountable user administration and abuse visibility without exposing administrative privileges to ordinary customers or automation.

## ADDED Requirements

### Requirement: Infrastructure-backed administration

The service SHALL integrate the requested Better Auth Infrastructure Dashboard for user search, status management, and session revocation. Administrative APIs MUST be protected by the provider's verified administrative authentication and MUST NOT be exposed through ordinary account keys or customer UI controls.

#### Scenario: Customer probes administrative route

- **WHEN** an ordinary customer or API key invokes user administration
- **THEN** the request is denied regardless of whether the route is visible in navigation
- **AND** no other customer's records are returned.

### Requirement: Redacted audit history

Authentication and security events SHALL be collected through the requested audit-log integration. Vault publication/deletion, key lifecycle, agent grants/execution, usage export, and administrative changes SHALL have durable attributable application audit records without note bodies, passwords, raw keys, session cookies, or payment secrets.

#### Scenario: Revocation audit

- **WHEN** a user or administrator revokes a key, grant, or session
- **THEN** an audit record identifies actor UUID, target identifier, action, outcome, and UTC time
- **AND** the revoked credential itself is absent.

### Requirement: Scoped audit access

Customers SHALL see only their own permitted activity. Global administration SHALL use a separately authorized operator view; organization-only audit APIs MUST NOT be presented as a global user-administration mechanism.

#### Scenario: Audit query with another UUID

- **WHEN** a customer changes the requested audit user ID
- **THEN** results remain restricted to the authenticated account or the request is denied.

### Requirement: Sentinel protection and client integration

The service SHALL integrate Sentinel server checks and the matching browser identification/challenge client. Required infrastructure credentials, unavailable service behavior, fingerprinting disclosure, and initial detection policy MUST be documented and verified before enabling production protection.

#### Scenario: Missing Sentinel configuration

- **WHEN** production configuration lacks required Infrastructure credentials
- **THEN** readiness checks fail instead of claiming active Sentinel protection
- **AND** the application does not silently accept an allow-mode fallback as protected operation.

### Requirement: Reviewed abuse response

Security policies SHALL initially use a documented observable rollout, with explicit approval before stricter blocking thresholds. Suspending an account MUST revoke private automation and public publication access and preserve a reviewable audit trail.

#### Scenario: Account suspension

- **WHEN** an authorized operator suspends an account
- **THEN** subsequent publishing, API, MCP, and public-content requests follow the suspension policy
- **AND** existing object data is not silently destroyed.
