import { useSession } from "@/features/session";
import { useApiData } from "@/lib/hooks/useApiData";
import { listStashes } from "../api";

export function useStashes() {
  const { repository, revisions } = useSession();

  return useApiData(
    () =>
      repository === null
        ? Promise.resolve([])
        : listStashes(repository.workspace_id, repository.id),
    [repository?.id, revisions.stashes],
  );
}
