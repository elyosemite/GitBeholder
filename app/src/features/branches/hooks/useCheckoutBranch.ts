import { useCallback } from "react";
import { useSession } from "@/features/session";
import { checkoutBranch } from "../api";

export function useCheckoutBranch() {
  const { repository, setBranch } = useSession();

  return useCallback(
    async (name: string) => {
      if (!repository) return;
      await checkoutBranch(repository.workspace_id, repository.id, name);
      setBranch(name);
    },
    [repository, setBranch],
  );
}
