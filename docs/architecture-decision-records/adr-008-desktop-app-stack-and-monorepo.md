# ADR 008 - Desktop App Stack (Tauri) and Monorepo Placement

**Status**: `Approved`

## Context

GitBeholder needs a desktop frontend to consume the backend API ([ADR 001](adr-001-use-of-elixir.md)). Earlier project documentation (the README's Tech Stack section) had informally pencilled in React/Electron as the plan, but no ADR had formally decided this, and no frontend code existed yet.

Two decisions needed to be made before writing any frontend code:

1. Which desktop application framework to build on.
2. Whether that frontend lives in this same repository or a separate one.

## Decision

### Framework: Tauri + React + TypeScript

We chose **Tauri** (Rust-based webview shell) with a **React + TypeScript** frontend, over Electron.

### Placement: same repository, under `app/`

The desktop app lives in this repository, under `app/`, alongside the Phoenix backend (`lib/`, `test/`, etc.). The two are independent runtime processes — the desktop app is simply an HTTP client of the backend's API — but share one repository during this early, fast-iterating stage.

## Alternatives Considered

* **Electron + React + TypeScript**: the originally informally-planned option. More mature ecosystem and broader Node API surface, but ships a full Chromium + Node runtime per app (much larger bundle/memory footprint) that isn't needed here — GitBeholder only needs a webview to render a REST API, not deep Node integration.
* **Separate repository for the desktop app**: would give cleaner separation of concerns and independent versioning, but adds overhead in keeping the API contract in sync across two repositories while both the backend and frontend are still changing rapidly, early in the project. Not chosen for now; extracting `app/` into its own repository later (e.g., via `git subtree split`) remains straightforward if this project grows enough contributors or release cadence to warrant it.

## Consequences

**Positive**:

* Smaller distributable (Tauri apps are typically a fraction of the size of an equivalent Electron app).
* One repository to clone, branch, and review during early development — no cross-repo coordination needed while the API is still evolving.
* Tauri's stricter default security posture (no Node runtime exposed to the frontend by default) fits GitBeholder's local-only, single-user trust model already established for the backend.

**Negative**:

* Mixed toolchains in one repository (Elixir/Mix alongside Rust/Cargo and Node/pnpm), which complicates CI setup compared to a single-language repo.
* Contributors who only care about one side (backend or frontend) still clone the whole repository.
* Tauri's Rust layer is a smaller ecosystem than Electron's Node-based one; some future integrations that assume Node APIs may need more adaptation.
