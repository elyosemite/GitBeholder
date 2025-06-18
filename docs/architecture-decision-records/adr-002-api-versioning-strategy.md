# ADR 002 - API Versioning Strategy

**Status**: `Approved`

## Context

GitBeholder is a **Git Management Tool** that exposes a backend API to be consumed by a desktop frontend. As the system evolves, the API will likely undergo changes — new features, modified response formats, or deprecated endpoints. To avoid breaking compatibility with older versions of the frontend and to enable a smooth evolution path, a clear and consistent versioning strategy is necessary.

The first service being developed is the **repository management module**, which includes:

* Creating, editing, and removing namespaces;
* Adding one or multiple Git projects to a namespace;
* Managing a default namespace (`Default`);
* Synchronizing selected branches (e.g., `main`) from one or multiple repositories.

## Decision

We decided to version the GitBeholder API using a **URL path prefix strategy**, starting with version `v1`.

* All routes will be prefixed with `/api/v1/`;
* Codebase modules will be organized under `GitBeholderWeb.V1` for better isolation;
* New versions (e.g., `/api/v2/`) will be introduced only when breaking changes are needed;
* Optional: API responses will include a custom header like `x-api-version: v1`.

This approach keeps routing clear, supports parallel development of multiple API versions, and ensures stability for frontend consumers.

## Alternatives Considered

* **No Versioning**: This would cause serious issues in the future when the API changes, especially for backward compatibility.
* **Header-based Versioning**: More flexible, but harder to debug and less explicit in URLs.
* **Query Parameter Versioning**: Not RESTful, and not well-supported in some HTTP caching mechanisms.

## Consequences

**Positive**:

* **Stability**: Consumers can safely depend on a consistent API version.
* **Clarity**: Developers can clearly see which version they are working with, both in URLs and code structure.
* **Extensibility**: Future changes or experimental features can be added to new versions without breaking existing clients.

**Negative**:

* **Code Duplication Risk**: Over time, maintaining multiple versions can lead to duplicated logic.
* **Initial Overhead**: Requires some upfront design to organize controllers and routes by version.
