import { useSessionValue } from "@/features/session";
import { useApiData } from "@/lib/hooks/useApiData";
import { getPushStatus } from "../api";

export function usePushStatus() {
  const repository = useSessionValue((s) => s.repository);
  // Just this scope's counter: the whole revisions object changes on
  // every invalidate, which would re-render this hook for unrelated scopes.
  const revision = useSessionValue((s) => s.revisions.sync);

  return useApiData(
    () =>
      repository === null
        ? Promise.resolve({ ahead: 0, behind: 0 })
        : getPushStatus(repository.workspace_id, repository.id),
    [repository?.id, revision],
  );
}
