# Tenant storage

## Purpose

Store notebook data in private multitenant object storage with trustworthy byte totals, bounded uploads, and recoverable cleanup.

## ADDED Requirements

### Requirement: Private bucket access

The notebook bucket MUST deny direct public access through managed and custom storage domains. Application users MUST NOT receive account-wide storage credentials. Browser transfers SHALL go through authenticated application endpoints unless a separately reviewed narrowly scoped upload flow is introduced.

#### Scenario: Direct bucket request

- **WHEN** an unauthenticated visitor requests a private object through a storage domain
- **THEN** storage does not expose the object
- **AND** published objects are available only through publication-aware application routes.

### Requirement: Server-owned object namespace

All vault objects MUST use server-generated keys partitioned by account UUID, vault UUID, and immutable revision. Normalized notebook paths SHALL be metadata, not an unchecked means of selecting another tenant's storage prefix.

#### Scenario: Forged upload destination

- **WHEN** a client supplies another user's prefix or a traversal filename
- **THEN** the server rejects the request or assigns an authorized server-owned destination
- **AND** no cross-tenant object is written or replaced.

### Requirement: Atomic capacity reservation

Uploads MUST reserve capacity against account quotas before accepting content. Concurrent uploads, replacements, failed uploads, and retries MUST NOT exceed the permitted account capacity or double-count finalized data.

#### Scenario: Concurrent uploads near capacity

- **WHEN** two imports individually fit but together exceed remaining capacity
- **THEN** at most the permitted capacity is reserved
- **AND** the other request receives an actionable quota response without corrupting stored totals.

### Requirement: Transparent storage totals

The dashboard SHALL show logical hosted bytes and the separately identified retained/staging physical bytes. Accounting MUST use server-observed object sizes, correctly handle replacement/deletion, and reconcile metadata against object storage.

#### Scenario: Retained old revision

- **WHEN** a newly activated revision replaces an old one
- **THEN** the dashboard distinguishes active notebook bytes from retained recovery copies
- **AND** the user is not unexpectedly charged twice for the same logical notebook.

### Requirement: Safe lifecycle configuration

Lifecycle changes MUST preserve existing rules unless deliberately replaced and MUST NOT expire active vault or publication objects. Abandoned multipart uploads and staging objects SHALL have bounded cleanup. Applying expiration to any preexisting prefix MUST require a reviewed inventory and recorded approval.

#### Scenario: Infrastructure setup

- **WHEN** the operator configures the existing notebook bucket
- **THEN** current access, CORS, lifecycle rules, and custom domains are recorded first
- **AND** no active notebook prefix receives an automatic deletion rule.

### Requirement: Idempotent storage recovery

Interrupted uploads, activation, cleanup, and reconciliation MUST be retryable. An object MUST NOT become active before durable metadata commits; failed cleanup MUST remain visible and retryable rather than being silently counted as complete.

#### Scenario: Storage write without metadata commit

- **WHEN** an object write succeeds but its metadata transaction fails
- **THEN** the object is not publicly reachable or treated as a completed import
- **AND** reconciliation identifies it for safe cleanup.
