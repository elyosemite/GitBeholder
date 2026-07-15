# GitBeholder

[![GitHub last commit](https://img.shields.io/github/last-commit/elyosemite/GitBeholder)](https://github.com/elyosemite/GitBeholder/commits/main)
[![GitHub issues](https://img.shields.io/github/issues/elyosemite/GitBeholder)](https://github.com/elyosemite/GitBeholder/issues)
[![GitHub stars](https://img.shields.io/github/stars/elyosemite/GitBeholder?style=social)](https://github.com/elyosemite/GitBeholder/stargazers)
[![Top language](https://img.shields.io/github/languages/top/elyosemite/GitBeholder)](mix.exs)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

GitBeholder is a modern Git backend designed to simplify and enhance your workflow. Built with Elixir and Phoenix, paired with a desktop app (`app/`, Tauri + React + TypeScript) living in this same repository, it allows users to perform key Git operations like `commits`, `pushes`, viewing `diffs`, exploring `commit history`, and more — all through a user-friendly interface.

> **Status:** The desktop app is being built incrementally. It now covers the daily Git loop end-to-end — browsing workspaces/repositories, staging, committing, pushing/pulling, branch switching, stashes, tags, and diffing — through a resizable, zoomable UI. Anything not yet wired into the UI is still reachable as a JSON API directly (see [API Documentation](#api-documentation)).

[API Docs](docs/Getting%20Started.md) · [Architecture Decision Records](docs/architecture-decision-records) · [DeepWiki](https://deepwiki.com/elyosemite/GitBeholder) · [Roadmap](#roadmap) · [Contributing](#contributing)

## Table of Contents

- [Highlights](#highlights)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Architecture Decision Records](#architecture-decision-records)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Star History](#star-history)

## Highlights

- **Visual Git history navigation** — walk commit history without leaving the app, including merge commits (diffed against their first parent).
- **Commit management** — stage/unstage, write a message, and create commits from the UI.
- **Push & pull** — send local commits upstream and bring remote changes down, with push status tracking.
- **Branch management** — list and switch branches.
- **Stashes & tags** — browse stashes and tags for the current repository.
- **Diff viewer** — inline file diffs per commit, with a resizable changes panel.
- **File change tracking** — see modified, untracked, and deleted files at a glance.
- **Multi-workspace/repository browsing** — organize repositories into workspaces and folders; clone, open-local, or init a repo from the UI.
- **Remote platform detection** — recognizes GitHub, GitLab, Bitbucket, and Azure DevOps remotes and shows the matching brand icon.
- **Zoomable UI + status bar** — adjustable zoom level and a footer showing the active repository.

## Tech Stack

- **Backend:** Elixir and Phoenix
- **Frontend:** Desktop app in `app/`, built with Tauri + React + TypeScript
- **Git Integration:** Native Git CLI operations via Elixir
- **API Communication:** RESTful JSON endpoints

## Getting Started

### Prerequisites

- Elixir `~> 1.14` (see [`mix.exs`](mix.exs))
- Erlang/OTP installed
  - ⚠️ Erlang/OTP **28.0** ships with a known Hex compatibility bug (`:re.import/1` undefined) that breaks `mix deps.get`. Use **28.1+** or **27.x** instead.
- Git installed and available in the system path

### Clone the Repository

```bash
git clone https://github.com/elyosemite/GitBeholder.git
cd GitBeholder
```

### Setup Backend (Phoenix)

```bash
mix deps.get
mix phx.server
```

The API will be available at `http://localhost:4000`.

### Setup Desktop App (Tauri)

Prerequisites: Rust (`cargo`/`rustc`), Node.js, and `pnpm`.

```bash
cd app
pnpm install
pnpm tauri dev
```

The app expects the Phoenix API to be running at `http://127.0.0.1:4000` (see [Setup Backend](#setup-backend-phoenix) above).

## Running Tests

Run the full automated suite (controller tests + unit tests):

```bash
mix test
```

Run a single test file:

```bash
mix test test/git_beholder_web/controllers/git_repository_controller_test.exs
```

Run a single test by line number:

```bash
mix test test/git_beholder_web/controllers/git_repository_controller_test.exs:12
```

### Testing the API manually

With the server running (`mix phx.server`), register a workspace and a repository, then query its status:

```bash
curl -X POST http://127.0.0.1:4000/api/v1/workspaces \
  -H "Content-Type: application/json" -d '{"name": "Engineering"}'

curl -X POST http://127.0.0.1:4000/api/v1/workspaces/1/repositories \
  -H "Content-Type: application/json" \
  -d '{"name": "my-repo", "path": "/path/to/a/git/repo"}'

curl http://127.0.0.1:4000/api/v1/workspaces/1/repositories/1/status
```

See [`docs/Getting Started.md`](docs/Getting%20Started.md) for the full endpoint reference with request/response examples.

## API Documentation

Full endpoint reference with request/response examples: [`docs/Getting Started.md`](docs/Getting%20Started.md)

## Project Structure

```
lib/
├── git_beholder/          # Core domain logic (one module per Git concern, via CLI)
│   ├── git_commit.ex
│   ├── git_diff.ex
│   ├── git_log.ex
│   ├── git_branches.ex
│   ├── git_push.ex / git_pull.ex
│   ├── git_staging.ex / git_stash.ex / git_tags.ex / git_status.ex / git_refs.ex
│   ├── repo.ex             # Ecto.Repo (SQLite)
│   └── repositories/       # Workspace/Folder/Repository schemas + context
└── git_beholder_web/       # Phoenix web layer
    ├── controllers/        # One JSON controller per Git module
    ├── plugs/              # FetchRepository — resolves + validates repository paths
    ├── endpoint.ex
    └── router.ex

app/                        # Desktop app (Tauri + React + TypeScript)
├── src/
│   ├── features/           # One folder per domain (branches, commits, push, pull,
│   │                       #  staging, stashes, tags, repositories, session), each
│   │                       #  with api.ts, types.ts, hooks/
│   ├── layout/              # Header, footer, resizable columns, AppShell
│   └── components/ui/       # shadcn/ui primitives (Tailwind v4)
└── src-tauri/               # Rust/Tauri shell (thin — no business logic)
```

## Architecture Decision Records

Design decisions behind the project are documented in [`docs/architecture-decision-records`](docs/architecture-decision-records).

## Roadmap

- Side-by-side diff view (currently inline only)
- Interactive hunk-level staging (whole-file stage/unstage exists today)
- Branch creation, rename, and delete (list & switch exist today)
- Tag creation (browsing exists today)
- Merge & rebase interface with conflict resolution
- Multi-repository dashboard
- Work item integrations (Azure DevOps, GitHub, GitLab, Jira, Linear, Bitbucket) — auto-close linked work items on merge
- Editor integrations (VS Code, JetBrains)
- Bring-your-own-LLM AI analysis and commit assistance
- AI agent management

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change or propose.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/awesome-feature`)
3. Commit your changes (`git commit -m 'Add awesome feature'`)
4. Push to the branch (`git push origin feature/awesome-feature`)
5. Open a pull request

Bugs and feature requests: use the [issue tracker](https://github.com/elyosemite/GitBeholder/issues).

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=elyosemite/GitBeholder&type=date)](https://www.star-history.com/#elyosemite/GitBeholder&type=date)

---
Made with 💙 using Elixir + Git
