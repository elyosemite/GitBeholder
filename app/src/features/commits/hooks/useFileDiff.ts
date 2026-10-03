import { useSessionValue } from "@/features/session";
import { useApiData } from "@/lib/hooks/useApiData";
import { getFileDiff } from "../api";
import type { DiffContext } from "../types";

export function useFileDiff(context: DiffContext = 3) {
  const repository = useSessionValue((s) => s.repository);
  const inspectedCommit = useSessionValue((s) => s.inspectedCommit);
  const diffFile = useSessionValue((s) => s.diffFile);

  return useApiData(
    () =>
      repository === null || inspectedCommit === null || diffFile === null
        ? Promise.resolve(null)
        : getFileDiff(repository.workspace_id, repository.id, inspectedCommit, diffFile, context),
    [repository?.id, inspectedCommit, diffFile, context],
  );
}
