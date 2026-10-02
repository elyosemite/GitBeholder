import { useSessionValue } from "@/features/session";
import { useApiData } from "@/lib/hooks/useApiData";
import { getFileDiff } from "../api";

export function useFileDiff() {
  const repository = useSessionValue((s) => s.repository);
  const inspectedCommit = useSessionValue((s) => s.inspectedCommit);
  const diffFile = useSessionValue((s) => s.diffFile);

  return useApiData(
    () =>
      repository === null || inspectedCommit === null || diffFile === null
        ? Promise.resolve(null)
        : getFileDiff(repository.workspace_id, repository.id, inspectedCommit, diffFile),
    [repository?.id, inspectedCommit, diffFile],
  );
}
