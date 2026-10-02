import { useCallback } from "react";
import { useSessionActions } from "@/features/session";
import { openLocalRepository } from "../api";
import { WORKSPACE_ID } from "../constants";

export function useOpenLocalRepository() {
  const { selectRepository } = useSessionActions();

  return useCallback(
    async (path: string) => {
      const repository = await openLocalRepository(WORKSPACE_ID, path);
      selectRepository(repository);
    },
    [selectRepository],
  );
}
