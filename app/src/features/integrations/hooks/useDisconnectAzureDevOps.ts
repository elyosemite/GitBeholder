import { useCallback } from "react";
import { useSession } from "@/features/session";
import { disconnectAzureDevOps } from "../api";

export function useDisconnectAzureDevOps() {
  const { repository, invalidate } = useSession();

  return useCallback(async () => {
    if (!repository) return;
    await disconnectAzureDevOps(repository.workspace_id, repository.id);
    invalidate("integrations");
  }, [repository, invalidate]);
}
