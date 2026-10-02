import { useSessionValue } from "@/features/session";
import { useApiData } from "@/lib/hooks/useApiData";
import { listCommits } from "../api";

export function useCommits() {
  const repository = useSessionValue((s) => s.repository);
  const branch = useSessionValue((s) => s.branch);
  // Just this scope's counter: the whole revisions object changes on
  // every invalidate, which would re-render this hook for unrelated scopes.
  const revision = useSessionValue((s) => s.revisions.commits);

  return useApiData(
    () =>
      repository === null || branch === null
        ? Promise.resolve([])
        : listCommits(repository.workspace_id, repository.id, branch),
    [repository?.id, branch, revision],
  );
}
