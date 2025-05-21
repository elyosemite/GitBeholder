# GitBeholder

GitBeholder is a modern Git backend designed to simplify and enhance your workflow. Built with an Elixir Phoenix and a separate frontend application (*it comes as soon as possible*), it allows users to perform key Git operations like ``commits``, ``pushes``, ``viewing diffs``, exploring ``commit history``, and more — all through a user-friendly interface.

## Features

- Visual Git history navigation
- Create and manage commits
- Push to remote repositories
- View commit details (`git show fd2ec6d62ef7e8c1c2ecd437b1a305439815b372`)
- Inline and side-by-side file diffs (`git diff`)
- File change tracking
- Interactive staging and unstaging

## Tech Stack

- **Backend:** Elixir and Phoenix
- **Frontend:** It will be build as soon as possible in React/Electron.
- **Git Integration:** Native Git CLI operations via Elixir
- **API Communication:** RESTful JSON endpoints

## Installation

### Prerequisites

- Elixir & Erlang installed
- Git installed and available in the system path

### Clone the Repository

```bash
git clone https://github.com/elyosemite/GitBeholder.git
cd GitBeholder
````

### Setup Backend (Phoenix)

```bash
mix deps.get
mix phx.server
```
## Roadmap

* Commit history viewer with author, date, and message
* Commit details view (git show fd2ec6d62ef7e8c1c2ecd437b1a305439815b372)
* Visual file diff viewer (inline & side-by-side)
* Interactive staging area (stage/unstage files & hunks)
* Commit creation via UI (with message input)
* Push and pull to/from remote repositories
* Branch management (create, rename, switch, delete)
* Tag creation and visualization
* Merge & rebase interface with conflict resolution
* Multi-repository dashboard

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change or propose.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/awesome-feature`)
3. Commit your changes (`git commit -m 'Add awesome feature'`)
4. Push to the branch (`git push origin feature/awesome-feature`)
5. Open a pull request

---
Made with 💙 using Elixir + Git