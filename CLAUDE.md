# GitBeholder

## Working conventions for multi-layer features

When a feature spans backend (Elixir/Phoenix) and frontend (React/TypeScript), or otherwise touches multiple files/layers, break the implementation into small, independently committable steps — plan the step list before writing code.

- **Backend before frontend.** Land and test the API surface first; build the UI on top of a working, tested endpoint.
- **Bottom-up within each side.** Shared/core logic and pure utilities before the code that consumes them. Every commit should leave the project compiling and passing checks on its own — never a commit that only makes sense once a later one lands.
- **Typical shape for a new API + UI feature:**
  1. Backend: core module (parsing/assembly/business logic) + its unit tests
  2. Backend: controller + route + controller tests (wires the module to HTTP)
  3. Frontend: new dependencies only (`pnpm add`, `shadcn` components) — isolated from feature code
  4. Frontend: leaf hooks/utilities with no UI consumers yet
  5. Frontend: presentational components built on those hooks, not yet mounted anywhere
  6. Frontend: the composing container component
  7. Frontend: wiring into navigation/session/app shell — the final commit that makes the feature reachable end-to-end
- **Verify per step**, not just at the end: `mix test` (+ the new test file) for backend steps, `npx tsc --noEmit` for frontend steps.
- Commit messages follow the `caveman-commit` skill (Conventional Commits, terse, why over what). Push immediately after each commit.
