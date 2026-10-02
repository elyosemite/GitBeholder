import { useCallback } from "react";
import { useSessionActions } from "@/features/session";
import { cloneRepository } from "../api";
import { WORKSPACE_ID } from "../constants";

export function useCloneRepository() {
  const { selectRepository } = useSessionActions();

  return useCallback(
    async (url: string, destination: string) => {
      const repository = await cloneRepository(WORKSPACE_ID, url, destination);
      selectRepository(repository);
    },
    [selectRepository],
  );
}
