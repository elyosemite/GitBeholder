import { useSessionValue } from "@/features/session";
import { useSharedApiData } from "@/lib/hooks/useSharedApiData";
import { listBranches } from "../api";

export function useBranches() {
  const repository = useSessionValue((s) => s.repository);
  // Just this scope's counter: the whole revisions object changes on
  // every invalidate, which would re-render this hook for unrelated scopes.
  const revision = useSessionValue((s) => s.revisions.branches);

  // Shared: several components read branches at once (header, overview
  // column) — one request serves them all.
  return useSharedApiData(
    `branches:${repository?.id ?? "none"}:${revision}`,
    () =>
      repository === null
        ? Promise.resolve([])
        : listBranches(repository.workspace_id, repository.id),
  );
}
