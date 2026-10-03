import { useSessionValue } from "@/features/session";
import { useApiData } from "@/lib/hooks/useApiData";
import { getCommitDetails } from "../api";

/** Metadata of the selected commit, for the commit panel. */
export function useCommitDetails() {
  const repository = useSessionValue((s) => s.repository);
  const inspectedCommit = useSessionValue((s) => s.inspectedCommit);

  return useApiData(
    () =>
      repository === null || inspectedCommit === null
        ? Promise.resolve(null)
        : getCommitDetails(repository.workspace_id, repository.id, inspectedCommit),
    [repository?.id, inspectedCommit],
  );
}
