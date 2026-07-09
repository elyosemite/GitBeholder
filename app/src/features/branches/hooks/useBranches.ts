import { useSession } from "@/features/session";
import { useApiData } from "@/lib/hooks/useApiData";
import { listBranches } from "../api";

export function useBranches() {
  const { repository, revisions } = useSession();

  return useApiData(
    () =>
      repository === null
        ? Promise.resolve([])
        : listBranches(repository.workspace_id, repository.id),
    [repository?.id, revisions.branches],
  );
}
