import { useSessionValue } from "@/features/session";
import { useSharedApiData } from "@/lib/hooks/useSharedApiData";
import { listStashes } from "../api";

export function useStashes() {
  const repository = useSessionValue((s) => s.repository);
  // Just this scope's counter: the whole revisions object changes on
  // every invalidate, which would re-render this hook for unrelated scopes.
  const revision = useSessionValue((s) => s.revisions.stashes);

  // Shared: several components read stashes at once (header, overview
  // column, activity bar) — one request serves them all.
  return useSharedApiData(
    `stashes:${repository?.id ?? "none"}:${revision}`,
    () =>
      repository === null
        ? Promise.resolve([])
        : listStashes(repository.workspace_id, repository.id),
  );
}
