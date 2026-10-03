import { useEffect, useState } from "react";
import { listRecentRepositories } from "@/features/repositories";
import { useSessionActions } from "@/features/session";
import { getTabsState } from "../store";

// Once per app launch (StrictMode mounts effects twice in dev).
let restoreStarted = false;

/**
 * On launch, reopens the repository the user had open last time; with no
 * history the app stays on the launcher. Returns true while deciding, so
 * the launcher doesn't flash before the repository opens.
 */
export function useRestoreLastRepository(): boolean {
  const { selectRepository } = useSessionActions();
  const [restoring, setRestoring] = useState(!restoreStarted);

  useEffect(() => {
    if (restoreStarted) return;
    restoreStarted = true;
    const initialTabId = getTabsState().activeId;

    listRecentRepositories(1)
      .then(([last]) => {
        // Skip if the user already moved on (picked a repo, opened settings).
        const untouched = getTabsState().activeId === initialTabId;
        if (last?.last_opened_at && untouched) selectRepository(last);
      })
      .catch(() => {
        // No history available: the launcher is the right place to start.
      })
      .finally(() => setRestoring(false));
  }, [selectRepository]);

  return restoring;
}
