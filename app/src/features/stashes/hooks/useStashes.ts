import { useSession } from "@/features/session";
import { useSharedApiData } from "@/lib/hooks/useSharedApiData";
import { listStashes } from "../api";

export function useStashes() {
  const { repository, revisions } = useSession();

  // Shared: several components read stashes at once (header, overview
  // column, activity bar) — one request serves them all.
  return useSharedApiData(
    `stashes:${repository?.id ?? "none"}:${revisions.stashes}`,
    () =>
      repository === null
        ? Promise.resolve([])
        : listStashes(repository.workspace_id, repository.id),
  );
}
