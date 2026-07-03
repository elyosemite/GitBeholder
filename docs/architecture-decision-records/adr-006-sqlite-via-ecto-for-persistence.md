# ADR 006 - SQLite via Ecto for Workspace/Folder/Repository Persistence

**Status**: `Approved`

## Context

Managing Workspaces, Folders, and Repositories ([ADR 005](adr-005-workspace-folder-repository-hierarchy.md)) requires full CRUD with durable state across restarts — a developer expects their registered repositories to still be there the next time they open GitBeholder. No datastore currently exists in the project (`mix.exs` has no Ecto dependency); the only persisted configuration today is a single `rootDirectory` value read from `priv/properties.json` via `GitBeholder.PropertyLoader`.

Upcoming roadmap items — Git LFS asset metadata and commit-history search indexing — will likely need structured, persistent storage as well, once they're picked back up.

## Decision

We introduce **Ecto with the SQLite3 adapter** (`ecto_sqlite3`) as the project's datastore, starting with schemas for `workspaces`, `folders`, and `repositories`. The SQLite database file lives locally alongside the application. This requires no separate database server to install, configure, or run, which fits GitBeholder's local-first, single-user trust model ([ADR 001](adr-001-use-of-elixir.md)).

## Alternatives Considered

* **Extending `priv/properties.json` with multiple namespaces/workspaces**: rejected — hand-rolled JSON mutation doesn't scale to relational data (the Folder self-reference, foreign keys to Workspace/Repository) and has no safe concurrent-write story.
* **In-memory GenServer state**: rejected — state must survive process and application restarts for a tool developers reopen daily; losing all registered Workspaces/Repositories on every restart is not acceptable.
* **A client-server database (PostgreSQL/MySQL)**: rejected — overkill for a single-user local companion process, and would introduce an operational dependency (a running database server) that contradicts the local-first model.

## Consequences

**Positive**:

* Durable state across restarts.
* Relational integrity (foreign keys) for the Folder tree and Workspace/Repository relationships.
* A ready foundation for future features (LFS metadata, commit indexing) without a second migration away from ad hoc storage.

**Negative**:

* Adds `ecto` and `ecto_sqlite3` as new dependencies, plus an Ecto migrations workflow that didn't exist before.
* The SQLite file needs a defined location and a backup/reset story (e.g., what happens if a developer deletes it, or wants to move it between machines).
