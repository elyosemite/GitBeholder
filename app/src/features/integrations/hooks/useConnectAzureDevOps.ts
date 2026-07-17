import { useCallback } from "react";
import { useSession } from "@/features/session";
import { connectAzureDevOps } from "../api";
import type { ConnectAzureDevOpsPayload } from "../types";

export function useConnectAzureDevOps() {
  const { repository, invalidate } = useSession();

  return useCallback(
    async (payload: ConnectAzureDevOpsPayload) => {
      if (!repository) return;
      await connectAzureDevOps(repository.workspace_id, repository.id, payload);
      invalidate("integrations");
    },
    [repository, invalidate],
  );
}
