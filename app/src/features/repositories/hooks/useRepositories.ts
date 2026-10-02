import { useSessionValue } from "@/features/session";
import { useApiData } from "@/lib/hooks/useApiData";
import { listRepositories } from "../api";
import { WORKSPACE_ID } from "../constants";

export function useRepositories() {
  // Just this scope's counter: the whole revisions object changes on
  // every invalidate, which would re-render this hook for unrelated scopes.
  const revision = useSessionValue((s) => s.revisions.repositories);

  return useApiData(() => listRepositories(WORKSPACE_ID), [WORKSPACE_ID, revision]);
}
