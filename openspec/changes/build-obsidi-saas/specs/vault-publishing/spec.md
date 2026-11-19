# Vault publishing

## Purpose

Let users host Obsidian notebooks privately and deliberately publish selected notes and safe attachments as readable, navigable websites.

## ADDED Requirements

### Requirement: Private vault creation and import

Users SHALL create named vaults and import notebook files with progress and actionable errors. Imports MUST remain private until explicit publication and exclude Obsidian configuration, plugin code, credentials, and hidden system files.

#### Scenario: First import

- **WHEN** a user imports a valid notebook archive
- **THEN** notes and supported attachments appear in a private preview
- **AND** no public route serves them before publication
- **AND** the import reports ignored and rejected entries.

### Requirement: Bounded archive processing

Import MUST enforce compressed size, expanded size, entry count, file size, nesting, and time limits. Traversal paths, absolute paths, symlinks, encrypted entries, duplicate normalized paths, executable content, and unsupported file types MUST be rejected without activating a partial import.

#### Scenario: Malicious archive

- **WHEN** an archive contains traversal entries or expands beyond its reservation
- **THEN** ingestion stops with a safe error and no new active revision
- **AND** the previous vault remains available and temporary storage is scheduled for cleanup.

### Requirement: Obsidian reading semantics

Published notes SHALL support Markdown, frontmatter titles, internal wikilinks with aliases and heading targets, supported attachment embeds, headings, code blocks, lists, tables, and callouts. Broken or private-note links MUST render safely without revealing private titles or content.

#### Scenario: Link to an unpublished note

- **WHEN** a published note contains a wikilink to an unpublished note
- **THEN** the reader does not expose the destination content or private metadata
- **AND** unsupported syntax has a documented safe fallback rather than executing plugin code.

### Requirement: Deliberate publication

Owners SHALL preview and select notes for a versioned public release with a unique public slug. Only selected notes and explicitly approved or required safe assets SHALL be served. Publishing MUST be atomic; failed releases MUST preserve the previous active release.

#### Scenario: Interrupted publication

- **WHEN** asset copying or validation fails before release activation
- **THEN** public URLs continue serving the previous complete release
- **AND** the dashboard identifies the failed attempt and permits a safe retry.

### Requirement: Safe public reader and search

Readers SHALL navigate a vault file tree, article, heading contents, and search index scoped to the active published release. Untrusted HTML, scripts, unsafe URL schemes, active attachments, and external embeds MUST NOT execute in the application's authenticated origin.

#### Scenario: Stored content injection

- **WHEN** a note contains script HTML, an unsafe link, or an active SVG attachment
- **THEN** rendering sanitizes or rejects it and session data remains inaccessible
- **AND** search contains no unpublished notes.

### Requirement: Revocable public access

Unpublishing, note removal, or account suspension MUST stop newly requested access immediately after the operation succeeds, including previously cached content. Public serving MUST check the active publication state before returning notes, attachments, or search data.

#### Scenario: Cached unpublished attachment

- **WHEN** an owner unpublishes a vault and a reader requests a previously cached note or attachment
- **THEN** the server denies access rather than returning the cached response
- **AND** the UI explains that already downloaded copies cannot be recalled.

### Requirement: Portable export and explicit deletion

Owners SHALL export original notes and supported attachments in a portable archive. Vault deletion MUST require confirmation, immediately revoke public access, and report cleanup status under the documented retention policy.

#### Scenario: Export after publishing

- **WHEN** an owner exports a hosted vault
- **THEN** the export includes original Markdown and attachment paths without service credentials or another tenant's data
- **AND** publication is not required for export.
