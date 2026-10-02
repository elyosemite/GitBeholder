import { useSessionValue } from "@/features/session";
import { useApiData } from "@/lib/hooks/useApiData";
import { listTags } from "../api";

export function useTags() {
  const repository = useSessionValue((s) => s.repository);
  const revisions = useSessionValue((s) => s.revisions);

  return useApiData(
    () =>
      repository === null
        ? Promise.resolve([])
        : listTags(repository.workspace_id, repository.id),
    [repository?.id, revisions.tags],
  );
}
