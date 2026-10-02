import { useSessionValue } from "@/features/session";
import { useApiData } from "@/lib/hooks/useApiData";
import { getAzureDevOpsIntegration } from "../api";

export function useAzureDevOpsIntegration() {
  const repository = useSessionValue((s) => s.repository);
  // Just this scope's counter: the whole revisions object changes on
  // every invalidate, which would re-render this hook for unrelated scopes.
  const revision = useSessionValue((s) => s.revisions.integrations);

  return useApiData(
    () =>
      repository === null
        ? Promise.resolve(null)
        : getAzureDevOpsIntegration(repository.workspace_id, repository.id),
    [repository?.id, revision],
  );
}
