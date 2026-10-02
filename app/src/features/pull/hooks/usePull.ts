import { useCallback } from "react";
import { useSessionActions, useSessionValue } from "@/features/session";
import { pull } from "../api";

export function usePull() {
  const repository = useSessionValue((s) => s.repository);
  const { invalidate } = useSessionActions();

  return useCallback(async () => {
    if (!repository) return;
    try {
      await pull(repository.workspace_id, repository.id);
    } finally {
      invalidate("commits", "status", "sync", "branches");
    }
  }, [repository, invalidate]);
}
