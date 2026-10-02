import { useCallback } from "react";
import { useSessionActions, useSessionValue } from "@/features/session";
import { stageFile, unstageFile } from "../api";

export function useStagingActions() {
  const repository = useSessionValue((s) => s.repository);
  const { invalidate } = useSessionActions();

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
