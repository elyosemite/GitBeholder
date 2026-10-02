import { useSessionValue } from "@/features/session";
import { useApiData } from "@/lib/hooks/useApiData";
import { listStatus } from "../api";

export function useStatus() {
  const repository = useSessionValue((s) => s.repository);
  const revisions = useSessionValue((s) => s.revisions);

  return useApiData(
    () =>
      repository === null
        ? Promise.resolve([])
        : listStatus(repository.workspace_id, repository.id),
    [repository?.id, revisions.status],
  );
}
