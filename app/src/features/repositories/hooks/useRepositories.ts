import { useSession } from "@/features/session";
import { useApiData } from "@/lib/hooks/useApiData";
import { listRepositories } from "../api";
import { WORKSPACE_ID } from "../constants";

export function useRepositories() {
  const { revisions } = useSession();

  return useApiData(() => listRepositories(WORKSPACE_ID), [WORKSPACE_ID, revisions.repositories]);
}
