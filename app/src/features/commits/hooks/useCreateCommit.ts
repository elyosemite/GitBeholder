import { useCallback } from "react";
import { useSessionActions, useSessionValue } from "@/features/session";
import { createCommit } from "../api";

export function useCreateCommit() {
  const repository = useSessionValue((s) => s.repository);
  const { invalidate } = useSessionActions();

  return useCallback(
    async (message: string) => {
      if (!repository) return;
      await createCommit(repository.workspace_id, repository.id, message);
      invalidate("commits", "status", "sync");
    },
    [repository, invalidate],
  );
}
