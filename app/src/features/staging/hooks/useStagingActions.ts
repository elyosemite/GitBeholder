import { useCallback } from "react";
import { useSession } from "@/features/session";
import { stageFile, unstageFile } from "../api";

export function useStagingActions() {
  const { repository, invalidate } = useSession();

  const stage = useCallback(
    async (path: string) => {
      if (!repository) return;
      try {
        await stageFile(repository.workspace_id, repository.id, path);
      } finally {
        invalidate("status");
      }
    },
    [repository, invalidate],
  );

  const unstage = useCallback(
    async (path: string) => {
      if (!repository) return;
      try {
        await unstageFile(repository.workspace_id, repository.id, path);
      } finally {
        invalidate("status");
      }
    },
    [repository, invalidate],
  );

  return { stage, unstage };
}
