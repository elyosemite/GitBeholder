import { useApiData } from "@/lib/hooks/useApiData";
import { listRepositories } from "../api";

// Hardcoded until a workspace picker / session.workspace exists.
const WORKSPACE_ID = 1;

export function useRepositories() {
  return useApiData(() => listRepositories(WORKSPACE_ID), [WORKSPACE_ID]);
}
