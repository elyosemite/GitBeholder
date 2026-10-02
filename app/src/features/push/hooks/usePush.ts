import { useCallback } from "react";
import { useSessionActions, useSessionValue } from "@/features/session";
import { push } from "../api";

export function usePush() {
  const repository = useSessionValue((s) => s.repository);
  const { invalidate } = useSessionActions();

  return useCallback(async () => {
    if (!repository) return;
    try {
      await push(repository.workspace_id, repository.id);
    } finally {
      invalidate("sync");
    }
  }, [repository, invalidate]);
}
