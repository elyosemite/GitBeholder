import { useCallback } from "react";
import { useSession } from "@/features/session";
import { testAzureDevOpsConnection } from "../api";
import type { ConnectAzureDevOpsPayload } from "../types";

export function useTestAzureDevOpsConnection() {
  const { repository } = useSession();

  // Doesn't persist anything, so it doesn't invalidate the integrations scope.
  return useCallback(
    async (payload: ConnectAzureDevOpsPayload) => {
      if (!repository) throw new Error("No repository selected");
      return testAzureDevOpsConnection(repository.workspace_id, repository.id, payload);
    },
    [repository],
  );
}
