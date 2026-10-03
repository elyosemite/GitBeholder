import { useEffect } from "react";
import { useSessionValue } from "@/features/session";
import { openRepositoryTab } from "../store";

/**
 * Whatever selects a repository (header picker, open local, clone) opens
 * or focuses its tab, so those flows don't need to know about tabs.
 * Mounted once, by the tab bar.
 */
export function useRepositoryTabSync() {
  const repository = useSessionValue((s) => s.repository);

  useEffect(() => {
    if (repository) openRepositoryTab(repository);
  }, [repository]);
}
