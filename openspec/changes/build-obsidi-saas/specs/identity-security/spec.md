# Identity and security

## Purpose

Provide verified account identities and a consistent authorization boundary for every private vault, usage, billing, and developer operation.

## ADDED Requirements

### Requirement: Stable UUID identity

Every user SHALL receive a server-generated UUID that remains stable across sessions, email changes, vaults, API keys, agent grants, usage records, and Stripe references. Clients MUST NOT assign their own ownership UUIDs.

#### Scenario: Account creation

- **WHEN** a person completes registration
- **THEN** the stored account ID is a valid UUID
- **AND** subsequent sessions resolve the same UUID without deriving it from an email address.

### Requirement: Verified account lifecycle

The system SHALL support email/password registration, email verification, sign-in/out, password reset, session listing/revocation, export, and account deletion. Unverified accounts MUST NOT publish or start paid subscriptions. Verification and recovery tokens MUST be expiring, single-use, and absent from logs.

#### Scenario: Recovery token replay

- **WHEN** a previously used or expired recovery token is submitted
- **THEN** the password remains unchanged and the request is rejected
- **AND** responses do not reveal whether an arbitrary email belongs to an account.

### Requirement: Server-side bot protection

Registration, password sign-in, and password-reset requests MUST validate Turnstile server-side. Missing, expired, replayed, or invalid tokens and verification outages MUST NOT bypass protection.

#### Scenario: Invalid bot challenge

- **WHEN** a protected authentication request has no valid challenge result
- **THEN** the operation is rejected before account or session creation
- **AND** the UI offers an accessible retry without exposing secrets.

### Requirement: Tenant authorization

All private data access MUST derive identity from a verified server-side session, API key, or agent grant and check object ownership. Supplied UUIDs, hidden UI controls, encrypted props, and unguessable identifiers MUST NOT serve as authorization.

#### Scenario: Cross-tenant object access

- **WHEN** user A requests user B's vault, file, usage, API key, subscription, export, or agent grant
- **THEN** the request returns a consistent forbidden or not-found response
- **AND** no data, mutation, or existence-sensitive metadata is exposed.

### Requirement: Session and mutation protections

Production sessions MUST use secure HTTP-only cookies and a bounded lifetime. Cookie-authenticated mutations MUST enforce trusted origins and CSRF protections. Authentication and recovery endpoints MUST enforce server-side rate limits.

#### Scenario: Cross-site mutation

- **WHEN** an unrelated origin submits a cookie-authenticated publishing or account mutation
- **THEN** the mutation is denied even if the browser contains a valid session.

### Requirement: Safe account closure

Deletion MUST revoke sessions, keys, and agent grants, stop public serving, and initiate documented idempotent cleanup. Active or financially unsettled subscriptions MUST be resolved before final account removal; required billing records MUST follow the disclosed retention policy.

#### Scenario: Deletion during an active subscription

- **WHEN** a user requests deletion with an active subscription
- **THEN** the interface explains the billing prerequisite and provides cancellation access
- **AND** it does not silently remove the identity while leaving recurring charges active.
