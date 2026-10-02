import { useCallback } from "react";
import { useSessionValue } from "@/features/session";
import { testAzureDevOpsConnection } from "../api";
import type { ConnectAzureDevOpsPayload } from "../types";

export function useTestAzureDevOpsConnection() {
  const repository = useSessionValue((s) => s.repository);

  // Doesn't persist anything, so it doesn't invalidate the integrations scope.
  return useCallback(
    async (payload: ConnectAzureDevOpsPayload) => {
      if (!repository) throw new Error("No repository selected");
      return testAzureDevOpsConnection(repository.workspace_id, repository.id, payload);
    },
    [repository],
  );
}
