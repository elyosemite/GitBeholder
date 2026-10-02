import { useSessionValue } from "@/features/session";
import { useApiData } from "@/lib/hooks/useApiData";
import { listCommits } from "../api";

export function useCommits() {
  const repository = useSessionValue((s) => s.repository);
  const branch = useSessionValue((s) => s.branch);
  const revisions = useSessionValue((s) => s.revisions);

  return useApiData(
    () =>
      repository === null || branch === null
        ? Promise.resolve([])
        : listCommits(repository.workspace_id, repository.id, branch),
    [repository?.id, branch, revisions.commits],
  );
}
