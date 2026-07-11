import { useCallback } from "react";
import { useSession } from "@/features/session";
import { push } from "../api";

export function usePush() {
  const { repository, invalidate } = useSession();

  return useCallback(async () => {
    if (!repository) return;
    try {
      await push(repository.workspace_id, repository.id);
    } finally {
      invalidate("sync");
    }
  }, [repository, invalidate]);
}
