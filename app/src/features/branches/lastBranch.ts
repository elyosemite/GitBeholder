const STORAGE_KEY = "gitbeholder.lastBranch";

// localStorage can be unavailable or throw; the repo then just opens with
// no remembered branch.
function readAll(): Record<string, string> {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    return stored && typeof stored === "object" ? stored : {};
  } catch {
    return {};
  }
}

/** The branch last selected in this repository, if any. */
export function readLastBranch(repositoryId: number): string | null {
  return readAll()[repositoryId] ?? null;
}

export function writeLastBranch(repositoryId: number, branch: string) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readAll(), [repositoryId]: branch }));
  } catch {
    // not persisted; the selection still holds for this session
  }
}
