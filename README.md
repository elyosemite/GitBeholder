# GitBeholder

[![GitHub last commit](https://img.shields.io/github/last-commit/elyosemite/GitBeholder)](https://github.com/elyosemite/GitBeholder/commits/main)
[![GitHub issues](https://img.shields.io/github/issues/elyosemite/GitBeholder)](https://github.com/elyosemite/GitBeholder/issues)
[![GitHub stars](https://img.shields.io/github/stars/elyosemite/GitBeholder?style=social)](https://github.com/elyosemite/GitBeholder/stargazers)
[![Top language](https://img.shields.io/github/languages/top/elyosemite/GitBeholder)](mix.exs)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

GitBeholder is a modern Git backend designed to simplify and enhance your workflow. Built with Elixir and Phoenix, with a separate frontend application planned (*coming as soon as possible*), it allows users to perform key Git operations like `commits`, `pushes`, viewing `diffs`, exploring `commit history`, and more — all through a user-friendly interface.

> **Status:** GitBeholder is backend-only right now. There is no bundled UI yet — you interact with it as a JSON API (see [API Documentation](#api-documentation)).

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

- **Visual Git history navigation** — walk commit history without leaving your editor.
- **Commit management** — create, view, and inspect commits (`git show fd2ec6d62ef7e8c1c2ecd437b1a305439815b372`).
- **Push to remote repositories** — send local commits upstream via the API.
- **Diff viewer** — inline and side-by-side file diffs (`git diff`).
- **File change tracking** — see modified, untracked, and deleted files at a glance.
- **Interactive staging** — stage and unstage files through simple HTTP calls.

## Tech Stack

- **Backend:** Elixir and Phoenix
- **Frontend:** Planned, to be built in React/Electron
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

## Running Tests

```bash
mix test
```

## API Documentation

Full endpoint reference with request/response examples: [`docs/Getting Started.md`](docs/Getting%20Started.md)

## Project Structure

```
lib/
├── git_beholder/          # Core domain logic (Git operations via CLI)
│   ├── git_commit.ex
│   ├── git_log.ex
│   ├── git_repository.ex
│   └── git_status.ex
└── git_beholder_web/       # Phoenix web layer
    ├── controllers/        # JSON API controllers
    ├── endpoint.ex
    └── router.ex
```

## Architecture Decision Records

Design decisions behind the project are documented in [`docs/architecture-decision-records`](docs/architecture-decision-records).

## Roadmap

- Commit history viewer with author, date, and message
- Commit details view (`git show fd2ec6d62ef7e8c1c2ecd437b1a305439815b372`)
- Visual file diff viewer (inline & side-by-side)
- Interactive staging area (stage/unstage files & hunks)
- Commit creation via UI (with message input)
- Push and pull to/from remote repositories
- Branch management (create, rename, switch, delete)
- Tag creation and visualization
- Merge & rebase interface with conflict resolution
- Multi-repository dashboard

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
