import { useSession } from "@/features/session";
import { useApiData } from "@/lib/hooks/useApiData";
import { listCommits } from "../api";

export function useCommits() {
  const { repository, branch, revisions } = useSession();

  return useApiData(
    () =>
      repository === null || branch === null
        ? Promise.resolve([])
        : listCommits(repository.workspace_id, repository.id, branch),
    [repository?.id, branch, revisions.commits],
  );
}
