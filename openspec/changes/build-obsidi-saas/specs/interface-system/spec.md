# Interface system

## Purpose

Give obsidi.xyz a coherent, accessible interface derived from the supplied visual references while retaining its own product identity.

## ADDED Requirements

### Requirement: Reference-grounded visual language

The interface SHALL use near-black backgrounds, neutral stepped surfaces, thin separators, bracketed navigation markers, restrained white primary actions, and JetBrains Mono v2.304. The repository MUST describe all three reference screenshots and map their visual patterns to at least 15 distinct shadcn/ui component types.

#### Scenario: Design provenance

- **WHEN** a contributor opens the design documentation
- **THEN** all three named screenshots have detailed descriptions and component mappings
- **AND** font version, license, color tokens, spacing, typography, and interaction states are documented.

### Requirement: Real component usage

The application SHALL use at least 15 distinct shadcn/ui component types in functional product screens rather than counting aliases, unused generated files, or mockups. A component inventory MUST identify each screen and its user interaction.

#### Scenario: Component inventory verification

- **WHEN** the frontend acceptance review runs
- **THEN** at least 15 documented component types are imported and rendered in reachable screens
- **AND** interactive types have keyboard and behavior checks.

### Requirement: Complete product surfaces

The interface SHALL provide landing/pricing, authentication/recovery, vault overview/detail/import/publishing, usage, billing, API keys, agent approvals, account/security, and public reader/search screens with loading, empty, error, success, and forbidden states where relevant.

#### Scenario: New account

- **WHEN** a verified user with no vaults opens the dashboard
- **THEN** the interface shows an actionable empty state, zero usage with units, account navigation, and a create/import action
- **AND** it does not present fixture vaults or invented production statistics.

### Requirement: Accessible responsive navigation

The interface MUST support keyboard navigation, visible focus, semantic headings and landmarks, labeled controls, reduced motion, and WCAG 2.2 AA contrast. It SHALL work at 360px, 768px, and 1440px widths without page-level horizontal overflow.

#### Scenario: Narrow reader and dashboard

- **WHEN** a keyboard or touch user opens either layout at 360px width
- **THEN** the navigation and contents rails collapse into accessible controls
- **AND** wide data tables scroll within their own containers
- **AND** dialog focus is trapped and restored on close.

### Requirement: Safe personalized island rendering

Personalized panels SHALL authenticate their own requests, reserve layout space with meaningful fallbacks, and return private non-cacheable responses. Public page content MUST remain usable when a nonessential personalized panel fails.

#### Scenario: Independent island authorization

- **WHEN** an unauthenticated caller directly requests a personalized panel endpoint or tampers with a vault identifier
- **THEN** no account data is returned
- **AND** the response cannot be reused through a shared cache for another user.
