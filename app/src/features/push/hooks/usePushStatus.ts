import { useSession } from "@/features/session";
import { useApiData } from "@/lib/hooks/useApiData";
import { getPushStatus } from "../api";

export function usePushStatus() {
  const { repository, revisions } = useSession();

  return useApiData(
    () =>
      repository === null
        ? Promise.resolve({ ahead: 0, behind: 0 })
        : getPushStatus(repository.workspace_id, repository.id),
    [repository?.id, revisions.sync],
  );
}
