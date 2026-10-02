import { useCallback } from "react";
import { useSessionActions, useSessionValue } from "@/features/session";
import { connectAzureDevOps } from "../api";
import type { ConnectAzureDevOpsPayload } from "../types";

export function useConnectAzureDevOps() {
  const repository = useSessionValue((s) => s.repository);
  const { invalidate } = useSessionActions();

  return useCallback(
    async (payload: ConnectAzureDevOpsPayload) => {
      if (!repository) return;
      await connectAzureDevOps(repository.workspace_id, repository.id, payload);
      invalidate("integrations");
    },
    [repository, invalidate],
  );
}
