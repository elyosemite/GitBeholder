# ADR 007 - Repository Access via a Dedicated Context and Plug

**Status**: `Approved`

## Context

Controllers today (`GitStatusController`, `GitCommitController`, `GitLogController`) each accept a raw filesystem path directly from request parameters — inconsistently named (`path` in `GitStatusController` vs. `repo_path` elsewhere) — and pass it straight into `System.cmd`-based Git operations (per [ADR 004](adr-004-git-operations-executed-via-ports.md)), with no validation against any known or registered repository. A client (or a bug in the future desktop frontend) can currently point any endpoint at any path on the host filesystem.

With the Workspace/Folder/Repository model ([ADR 005](adr-005-workspace-folder-repository-hierarchy.md)) and its SQLite-backed persistence ([ADR 006](adr-006-sqlite-via-ecto-for-persistence.md)), every Git operation should instead resolve a `workspace_id` + `repository_id` pair to a validated, registered path — never trust a path supplied directly by the client.

## Decision

We introduce a `GitBeholder.Repositories` context as the single entry point for resolving a repository reference to a filesystem path:

```elixir
Repositories.fetch_repository(workspace_id, repository_id)
# => {:ok, %Repositories.Repository{path: path, ...}}
# => {:error, :not_found}
# => {:error, :path_unavailable}
```

A Phoenix Plug (`GitBeholderWeb.Plugs.FetchRepository`) runs this resolution for every route nested under `/api/v1/workspaces/:workspace_id/repositories/:repository_id/*`, assigning the validated repository to `conn.assigns.repository` or halting the request with an error response before any controller action runs. Controllers never read or trust a client-supplied filesystem path directly — they only use `conn.assigns.repository.path`, already validated.

This also resolves the versioning strategy approved in [ADR 002](adr-002-api-versioning-strategy.md) (never implemented until now): Git-operation routes move under the `/api/v1/` prefix as part of this restructuring. The Folder tree from ADR 005 is not part of these routes — it exists only for browsing/organization endpoints, not for addressing Git operations.

## Alternatives Considered

* **Per-controller validation** (repeat the lookup/check in every controller action): rejected — duplicated logic that's easy to forget in a new controller, which is exactly how the current inconsistency (`path` vs. `repo_path`, no validation at all) came about.
* **Trusting client-supplied absolute paths** (current behavior): rejected — no defense against a frontend bug sending the wrong path into a destructive operation like commit or file discard.

## Consequences

**Positive**:

* A single, consistent, hard-to-bypass boundary for path resolution across all Git-operation endpoints.
* Controllers become simpler and cannot accidentally skip validation.
* Centralizes the stale-path check from ADR 005 in one place.

**Negative**:

* Every Git-operation route must be nested under the `workspace_id`/`repository_id` URL pattern, requiring the existing routes (`/api/git/status`, `/api/git/commit`, `/api/git/log`) to be restructured.
