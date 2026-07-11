import { useCallback } from "react";
import { useSession } from "@/features/session";
import { createCommit } from "../api";

export function useCreateCommit() {
  const { repository, invalidate } = useSession();

  return useCallback(
    async (message: string) => {
      if (!repository) return;
      await createCommit(repository.workspace_id, repository.id, message);
      invalidate("commits", "status", "sync");
    },
    [repository, invalidate],
  );
}
