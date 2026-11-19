# Developer access

## Purpose

Let users automate notebook management through account-owned API keys and explicitly authorized AI-agent capabilities without broadening tenant access.

## ADDED Requirements

### Requirement: Self-service account keys

Verified users SHALL create, name, list, expire, revoke, and replace API keys owned by their UUID. Raw keys MUST be displayed only at creation and stored using the authentication provider's secure hashing behavior; subsequent lists SHALL show only safe identifiers and metadata.

#### Scenario: Key creation and later listing

- **WHEN** an owner creates a key and later reopens the key list
- **THEN** the creation response contains the raw key once
- **AND** subsequent responses and logs never reveal it
- **AND** ownership comes from the server-side session.

### Requirement: Permission-limited API operations

API keys MUST enforce expiry, revocation, tenant ownership, explicit permissions, and account-wide limits on every request. API authentication MUST NOT grant dashboard, billing, admin, or key-minting privileges unless a separately approved capability explicitly allows it.

#### Scenario: Read-only key attempts publication

- **WHEN** a key without publish permission attempts to activate a public release
- **THEN** the request is denied without changing publication state
- **AND** possession of a vault ID cannot bypass the key's scope.

### Requirement: Remote MCP service

The service SHALL expose a remote MCP endpoint with discovery, tool listing, and scoped notebook tools for list, read, import/update, publish/unpublish, and usage inspection. Protocol negotiation, cancellation, malformed messages, and unsupported methods MUST have defined safe behavior.

#### Scenario: Unauthorized MCP client

- **WHEN** a caller requests a private MCP tool without valid agent authentication
- **THEN** no private tool result or notebook data is returned
- **AND** discovery alone grants no private access.

### Requirement: Explicit agent consent

Agent registration and execution SHALL use the requested Agent Auth protocol with a user-facing approval page showing agent identity, capabilities, vault scope, expiry, and mutating access. Unknown capabilities and unapproved grants MUST be denied; reads MUST NOT imply permission to publish or delete.

#### Scenario: Device approval

- **WHEN** an agent requests access and the user reviews its device code
- **THEN** the approval screen explains the requested scope and allows approval or denial
- **AND** denied or expired requests cannot execute tools.

### Requirement: Agent request validation

Every execution MUST verify signature, audience, expiry, replay protection, active grants, capability constraints, and resolved UUID ownership. Custom execution locations MUST apply the same checks as the default execution route.

#### Scenario: Replayed agent invocation

- **WHEN** a previously accepted signed request is replayed or sent to the wrong audience
- **THEN** execution is rejected
- **AND** no extra mutation or billable tool invocation occurs.

### Requirement: Revocable and auditable automation

Users SHALL list and revoke their agents and grants. Revoked keys or grants MUST stop authorizing new requests, including long-lived transport sessions; API and MCP actions SHALL produce tenant-linked usage and redacted audit records.

#### Scenario: Grant revoked during a connection

- **WHEN** an owner revokes an agent while its transport remains connected
- **THEN** its next tool invocation is denied
- **AND** a tool cannot substitute a caller-supplied account UUID.

### Requirement: Explicit unstable-protocol release gate

Agent Auth compatibility MUST be pinned and verified against a real MCP client before production enablement. Missing compatibility proof MUST be visible as an incomplete release gate rather than a claim that plugin installation alone implements MCP.

#### Scenario: Production readiness review

- **WHEN** the agent integration lacks a passing registration, consent, invocation, and revocation test
- **THEN** production MCP enablement remains blocked and the outstanding work is recorded.
