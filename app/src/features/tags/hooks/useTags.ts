import { useSession } from "@/features/session";
import { useApiData } from "@/lib/hooks/useApiData";
import { listTags } from "../api";

export function useTags() {
  const { repository, revisions } = useSession();

  return useApiData(
    () =>
      repository === null
        ? Promise.resolve([])
        : listTags(repository.workspace_id, repository.id),
    [repository?.id, revisions.tags],
  );
}
