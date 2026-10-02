import { useSessionValue } from "@/features/session";
import { useApiData } from "@/lib/hooks/useApiData";
import { listStatus } from "../api";

export function useStatus() {
  const repository = useSessionValue((s) => s.repository);
  // Just this scope's counter: the whole revisions object changes on
  // every invalidate, which would re-render this hook for unrelated scopes.
  const revision = useSessionValue((s) => s.revisions.status);

  return useApiData(
    () =>
      repository === null
        ? Promise.resolve([])
        : listStatus(repository.workspace_id, repository.id),
    [repository?.id, revision],
  );
}
