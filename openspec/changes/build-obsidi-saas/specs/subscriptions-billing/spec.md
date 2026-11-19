# Subscriptions and billing

## Purpose

Give account owners transparent, authorized subscription management and reproducible usage accounting without accidental or duplicate charges.

## ADDED Requirements

### Requirement: Owner-scoped customer mapping

Each paying account SHALL map its UUID to its Stripe customer and subscription reference. Checkout, portal, subscription listing, changes, and cancellation MUST authorize the current owner and use approved same-site return URLs.

#### Scenario: Forged billing reference

- **WHEN** a user submits another account's reference or customer ID to a billing endpoint
- **THEN** no checkout or portal access for that account is granted
- **AND** the event is recorded without exposing payment data.

### Requirement: Approved pricing before charging

Live billing MUST remain unavailable until the owner approves currency, prices, included storage/traffic/API/MCP units, overage rates, billing periods, rounding, tax handling, and delinquency policy. Displayed estimates MUST use the same approved versioned catalog as charging.

#### Scenario: Missing price configuration

- **WHEN** a live checkout is attempted before an approved price catalog exists
- **THEN** the application rejects checkout with an unavailable state
- **AND** it does not use invented prices, test IDs, or silently create paid products.

### Requirement: Subscription lifecycle

Verified owners SHALL start a subscription, inspect status, change plans, cancel, restore a pending cancellation, and open the billing portal. Existing subscriptions MUST be reused during changes rather than creating concurrent recurring charges.

#### Scenario: Plan change for an existing subscriber

- **WHEN** an account with an active subscription changes plan
- **THEN** the existing subscription identifier is used
- **AND** the UI explains effective date and any proration before confirmation.

### Requirement: Verified and replay-safe webhooks

Billing webhooks MUST verify the unmodified body and signature, deduplicate event IDs, and handle delayed or reordered deliveries without regressing current entitlements. Browser checkout success MUST NOT independently grant a paid plan.

#### Scenario: Replayed or reordered event

- **WHEN** a verified subscription event is delivered twice or arrives after a newer state
- **THEN** side effects do not duplicate and entitlements reflect reconciled current subscription state
- **AND** invalid signatures cause no state change.

### Requirement: Reproducible usage export

Usage charges MUST originate from the durable approved accounting source, use UTC half-open periods, preserve catalog version and source totals, and export with stable idempotency identifiers. Analytics estimates MUST NOT silently become exact charges.

#### Scenario: Export retry after timeout

- **WHEN** a billing export is retried after Stripe accepted the first attempt but the local response was lost
- **THEN** the same export identity is reused and no duplicate charge is produced
- **AND** the operator can reconcile the export against the source period.

### Requirement: Non-destructive entitlement changes

Payment failure, cancellation, or downgrade MUST follow the disclosed grace and quota policy. Stored notebooks MUST NOT be silently deleted because of payment failure or a lower plan; owners SHALL retain documented recovery/export access.

#### Scenario: Downgrade below current storage

- **WHEN** a downgrade takes effect below the account's current usage
- **THEN** the application explains the over-limit state and restricts new consumption under the approved policy
- **AND** it does not silently delete existing vault data.
