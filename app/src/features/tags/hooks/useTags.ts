import { useSessionValue } from "@/features/session";
import { useApiData } from "@/lib/hooks/useApiData";
import { listTags } from "../api";

export function useTags() {
  const repository = useSessionValue((s) => s.repository);
  // Just this scope's counter: the whole revisions object changes on
  // every invalidate, which would re-render this hook for unrelated scopes.
  const revision = useSessionValue((s) => s.revisions.tags);

  return useApiData(
    () =>
      repository === null
        ? Promise.resolve([])
        : listTags(repository.workspace_id, repository.id),
    [repository?.id, revision],
  );
}
