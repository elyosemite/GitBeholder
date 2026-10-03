import { useEffect, useRef } from "react";
import { useSessionActions, useSessionValue } from "@/features/session";
import { listBranches } from "../api";
import { readLastBranch, writeLastBranch } from "../lastBranch";

/**
 * Opens each repository on its last selected branch, remembered per
 * repository across app restarts. With nothing remembered (first open),
 * a repository with a single branch selects it; otherwise none is
 * selected. Restoring only selects the branch to show — it never runs a
 * checkout, so opening the app can't touch the working tree.
 * Mounted once, by the app shell.
 */
export function useBranchMemory() {
  const repository = useSessionValue((s) => s.repository);
  const branch = useSessionValue((s) => s.branch);
  const { setBranch } = useSessionActions();
  const branchRef = useRef(branch);
  branchRef.current = branch;

  // Remember every selection for the repository it was made in.
  useEffect(() => {
    if (repository && branch) writeLastBranch(repository.id, branch);
  }, [repository, branch]);

  // Restore when a repository opens (selecting a repository clears the
  // branch). Fetches the branches directly instead of reading the shared
  // list, which can still hold the previous repository's branches.
  useEffect(() => {
    if (!repository || branchRef.current !== null) return;
    let cancelled = false;
    const remembered = readLastBranch(repository.id);

    listBranches(repository.workspace_id, repository.id)
      .then((branches) => {
        // The user may have picked a branch (or another repo) meanwhile.
        if (cancelled || branchRef.current !== null) return;
        const names = branches.map((b) => b.name);

        if (remembered && names.includes(remembered)) setBranch(remembered);
        else if (names.length === 1) setBranch(names[0]);
      })
      .catch(() => {
        // Branch list unavailable: leave nothing selected, as on a first open.
      });

    return () => {
      cancelled = true;
    };
  }, [repository, setBranch]);
}
