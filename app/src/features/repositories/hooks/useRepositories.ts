import { useSessionValue } from "@/features/session";
import { useApiData } from "@/lib/hooks/useApiData";
import { listRepositories } from "../api";
import { WORKSPACE_ID } from "../constants";

export function useRepositories() {
  const revisions = useSessionValue((s) => s.revisions);

  return useApiData(() => listRepositories(WORKSPACE_ID), [WORKSPACE_ID, revisions.repositories]);
}
