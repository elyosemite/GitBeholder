import { useCallback } from "react";
import { useSessionActions, useSessionValue } from "@/features/session";
import { disconnectAzureDevOps } from "../api";

export function useDisconnectAzureDevOps() {
  const repository = useSessionValue((s) => s.repository);
  const { invalidate } = useSessionActions();

  return useCallback(async () => {
    if (!repository) return;
    await disconnectAzureDevOps(repository.workspace_id, repository.id);
    invalidate("integrations");
  }, [repository, invalidate]);
}
