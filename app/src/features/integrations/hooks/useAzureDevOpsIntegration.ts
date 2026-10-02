import { useSessionValue } from "@/features/session";
import { useApiData } from "@/lib/hooks/useApiData";
import { getAzureDevOpsIntegration } from "../api";

export function useAzureDevOpsIntegration() {
  const repository = useSessionValue((s) => s.repository);
  const revisions = useSessionValue((s) => s.revisions);

  return useApiData(
    () =>
      repository === null
        ? Promise.resolve(null)
        : getAzureDevOpsIntegration(repository.workspace_id, repository.id),
    [repository?.id, revisions.integrations],
  );
}
