import { useSession } from "@/features/session";
import { useApiData } from "@/lib/hooks/useApiData";
import { getAzureDevOpsIntegration } from "../api";

export function useAzureDevOpsIntegration() {
  const { repository, revisions } = useSession();

  return useApiData(
    () =>
      repository === null
        ? Promise.resolve(null)
        : getAzureDevOpsIntegration(repository.workspace_id, repository.id),
    [repository?.id, revisions.integrations],
  );
}
