import { useSession } from "@/features/session";
import { useApiData } from "@/lib/hooks/useApiData";
import { getFileDiff } from "../api";

export function useFileDiff() {
  const { repository, inspectedCommit, diffFile } = useSession();

  return useApiData(
    () =>
      repository === null || inspectedCommit === null || diffFile === null
        ? Promise.resolve(null)
        : getFileDiff(repository.workspace_id, repository.id, inspectedCommit, diffFile),
    [repository?.id, inspectedCommit, diffFile],
  );
}
