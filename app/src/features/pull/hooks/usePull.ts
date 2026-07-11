import { useCallback } from "react";
import { useSession } from "@/features/session";
import { pull } from "../api";

export function usePull() {
  const { repository, invalidate } = useSession();

  return useCallback(async () => {
    if (!repository) return;
    try {
      await pull(repository.workspace_id, repository.id);
    } finally {
      invalidate("commits", "status", "sync", "branches");
    }
  }, [repository, invalidate]);
}
