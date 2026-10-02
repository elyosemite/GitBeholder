import { useCallback } from "react";
import { useSessionActions, useSessionValue } from "@/features/session";
import { checkoutBranch } from "../api";

export function useCheckoutBranch() {
  const repository = useSessionValue((s) => s.repository);
  const { setBranch } = useSessionActions();

  return useCallback(
    async (name: string) => {
      if (!repository) return;
      await checkoutBranch(repository.workspace_id, repository.id, name);
      setBranch(name);
    },
    [repository, setBranch],
  );
}
