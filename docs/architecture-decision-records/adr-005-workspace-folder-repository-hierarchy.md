# ADR 005 - Workspace/Folder/Repository Hierarchy for Organizing Repositories

**Status**: `Approved`

## Context

GitBeholder needs to let developers organize many Git repositories the way they actually think about them — mirroring the organization they work within (e.g., "Engineering", "Sales"), with internal groupings (departments, teams, or just personal categories) underneath, and individual repositories that can live anywhere on disk rather than under one shared parent directory.

ADR-002 originally sketched a "namespace" concept for this (create/edit/remove namespaces, a default namespace, add projects to a namespace) as context for API versioning, but it was never implemented. The current codebase instead has `GitBeholder.GitRepository.root_path/0`, which scans a single configured root directory (`priv/properties.json` → `rootDirectory`) and lists its immediate subdirectories that contain a `.git` folder. This flat, scan-based model doesn't support repositories scattered across the filesystem, doesn't support logical grouping, and isn't wired into the other Git-operation endpoints at all (they accept raw paths directly).

## Decision

We introduce three persisted entities (see [ADR 006](adr-006-sqlite-via-ecto-for-persistence.md) for storage):

- **Workspace** — top-level entity representing the organization a developer works within (e.g., "Engineering", "Sales"). Repositories always belong to exactly one Workspace.
- **Folder** — a recursive, self-referential entity used purely for logical organization within a Workspace. A Folder can contain other Folders and/or Repositories. `parent_folder_id` is nullable: a Folder can live directly at the Workspace root.
- **Repository** — a leaf entity storing a display name and an absolute filesystem path, registered explicitly by the developer (not discovered by scanning a shared root directory). A Repository always has a `workspace_id` and an optional `folder_id` (nullable, meaning it lives directly at the Workspace root).

A Repository belongs to exactly one Workspace — it is not shared across multiple Workspaces. If the same physical repository is relevant to two organizations, it must be registered twice as independent records.

Because a Repository's path is captured once at registration time and the underlying directory can later be moved, renamed, or deleted outside of GitBeholder, every resolution of a Repository (see [ADR 007](adr-007-repository-context-and-plug.md)) verifies the path still exists and is still a valid Git repository before use, returning a specific `:path_unavailable` error instead of letting a raw Git CLI failure surface to the user.

## Alternatives Considered

* **Flat root-directory scan** (current behavior): rejected — doesn't support repositories scattered across the filesystem or logical grouping by organization/team.
* **Many-to-many Workspace↔Repository** (a repository shared across multiple Workspaces via a join table): considered to support repos shared across teams (e.g., a common `documentation` repo), but rejected for now in favor of simplicity. Can be revisited if cross-workspace sharing becomes a real need.
* **Mandatory Folder containment** (no items directly at the Workspace root): rejected as unnecessarily rigid — matches how a filesystem already lets files live at a drive's root without requiring a containing folder.

## Consequences

**Positive**:

* Matches how developers already think about their repositories (organization → internal grouping → project), decoupled from physical disk layout.
* Repositories can live anywhere on disk instead of under one shared parent directory.
* A clear, explicit registration model instead of implicit directory scanning.

**Negative**:

* Registered paths can go stale (moved/deleted outside GitBeholder), requiring a future "relocate repository" UX.
* No built-in support yet for a single repository shared across two Workspaces — would require duplicate registration.
