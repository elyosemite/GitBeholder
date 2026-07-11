import { useSession } from "@/features/session";
import { useApiData } from "@/lib/hooks/useApiData";
import { getCommitFiles } from "../api";

export function useCommitFiles() {
  const { repository, inspectedCommit } = useSession();

  return useApiData(
    () =>
      repository === null || inspectedCommit === null
        ? Promise.resolve([])
        : getCommitFiles(repository.workspace_id, repository.id, inspectedCommit),
    [repository?.id, inspectedCommit],
  );
}
