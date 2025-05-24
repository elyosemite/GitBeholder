# Git Management API Documentation

This API provides simplified access to Git features via HTTP endpoints. It aims to streamline common Git operations so developers can focus more on code and less on terminal commands.

---

## Git Status and Changes

### `GET /api/git/status`

**Description:**
Returns a list of all current file changes in the repository (`modified`, `untracked`, `deleted`, etc.).

**Example:**

```bash
curl "http://localhost:4000/api/git/status?repo_path=/your/path/to/repo"
```

**Success Response:**

```json
{
  "files": [
    { "status": "M", "path": "lib/example.ex" },
    { "status": "??", "path": "lib/new_file.ex" }
  ]
}
```

**Failure Response (invalid path):**

```json
{
  "error": "Invalid repository path or not a Git repository"
}
```

---

## Committing Changes

### `POST /api/git/commit-staged`

**Description:**
Commits all currently staged changes.

**Example:**

```bash
curl -X POST http://localhost:4000/api/git/commit-staged \
  -H "Content-Type: application/json" \
  -d '{"repo_path":"/your/path/to/repo", "message":"Staged commit"}'
```

**Success:**

```json
{
  "status": "ok",
  "output": "1 file changed, 2 insertions(+)"
}
```

**Failure (no changes staged):**

```json
{
  "status": "error",
  "message": "nothing to commit, working tree clean"
}
```

---

### `POST /api/git/commit-paths`

**Description:**
Commits specific file paths directly (adds + commits).

**Example:**

```bash
curl -X POST http://localhost:4000/api/git/commit-paths \
  -H "Content-Type: application/json" \
  -d '{"repo_path":"/your/repo", "paths":["lib/file1.ex","lib/file2.ex"], "message":"Custom commit"}'
```

**Success:**

```json
{
  "status": "ok",
  "committed": ["lib/file1.ex", "lib/file2.ex"],
  "output": "2 files changed"
}
```

**Failure (invalid file path):**

```json
{
  "status": "error",
  "message": "error: pathspec 'lib/wrong.ex' did not match any files"
}
```

---

## Reverting Files

### `POST /api/git/restore`

**Description:**
Restores (reverts) the specified files to the last committed state.

**Example:**

```bash
curl -X POST http://localhost:4000/api/git/restore \
  -H "Content-Type: application/json" \
  -d '{"repo_path":"/your/repo", "paths":["lib/file1.ex"]}'
```

**Success:**

```json
{
  "status": "ok",
  "reverted": ["lib/file1.ex"]
}
```

**Failure:**

```json
{
  "status": "error",
  "message": "fatal: pathspec 'lib/missing.ex' did not match any files"
}
```

---

## Branch Management

### `GET /api/git/branches`

**Description:**
Returns a list of local branches.

```bash
curl "http://localhost:4000/api/git/branches?repo_path=/your/repo"
```

**Success:**

```json
{
  "branches": ["main", "feature/api", "bugfix/login"],
  "current": "main"
}
```

**Failure:**

```json
{
  "error": "Not a git repository"
}
```

---

### `POST /api/git/branch/create`

**Description:**
Creates a new branch and switches to it.

```bash
curl -X POST http://localhost:4000/api/git/branch/create \
  -H "Content-Type: application/json" \
  -d '{"repo_path":"/your/repo", "branch":"new-feature"}'
```

**Success:**

```json
{
  "message": "Switched to a new branch 'new-feature'"
}
```

**Failure:**

```json
{
  "error": "A branch named 'new-feature' already exists."
}
```

---

## Commit History

### `GET /api/git/log?repo_path=...&limit=10`

**Description:**
Returns recent commit messages and metadata.

```bash
curl "http://localhost:4000/api/git/log?repo_path=/your/repo&limit=5"
```

**Success:**

```json
[
  {
    "hash": "abc123",
    "author": "Jane Doe",
    "message": "Initial commit",
    "date": "2024-05-01"
  }
]
```

---

## Staging & Unstaging

### `POST /api/git/stage`

**Description:**
Adds files to staging.

```bash
curl -X POST http://localhost:4000/api/git/stage \
  -H "Content-Type: application/json" \
  -d '{"repo_path":"/your/repo", "paths":["lib/foo.ex"]}'
```

**Success:**

```json
{
  "message": "Files staged successfully",
  "paths": ["lib/foo.ex"]
}
```

---

### `POST /api/git/unstage`

**Description:**
Removes files from staging.

```bash
curl -X POST http://localhost:4000/api/git/unstage \
  -H "Content-Type: application/json" \
  -d '{"repo_path":"/your/repo", "paths":["lib/foo.ex"]}'
```

**Success:**

```json
{
  "message": "Files unstaged",
  "paths": ["lib/foo.ex"]
}
```

---

## Snapshots (Stash)

### `POST /api/git/stash`

**Description:**
Creates a stash of current uncommitted changes.

```bash
curl -X POST http://localhost:4000/api/git/stash \
  -H "Content-Type: application/json" \
  -d '{"repo_path":"/your/repo", "message":"Temp changes"}'
```

**Success:**

```json
{
  "message": "Saved working directory and index state"
}
```

---

### `GET /api/git/stashes`

**Description:**
Lists all existing stashes.

```bash
curl "http://localhost:4000/api/git/stashes?repo_path=/your/repo"
```

**Success:**

```json
[
  { "index": 0, "message": "Temp changes", "branch": "main" }
]
```

---

### `POST /api/git/stash/apply`

**Description:**
Applies a stash by index.

```bash
curl -X POST http://localhost:4000/api/git/stash/apply \
  -H "Content-Type: application/json" \
  -d '{"repo_path":"/your/repo", "index":0}'
```

---

## Push & Pull

### `POST /api/git/push`

**Description:**
Pushes the current branch to the remote.

```bash
curl -X POST http://localhost:4000/api/git/push \
  -H "Content-Type: application/json" \
  -d '{"repo_path":"/your/repo"}'
```

---

### `POST /api/git/pull`

**Description:**
Pulls the latest changes from the remote.

```bash
curl -X POST http://localhost:4000/api/git/pull \
  -H "Content-Type: application/json" \
  -d '{"repo_path":"/your/repo"}'
```
