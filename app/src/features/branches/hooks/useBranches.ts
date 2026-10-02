import { useSessionValue } from "@/features/session";
import { useSharedApiData } from "@/lib/hooks/useSharedApiData";
import { listBranches } from "../api";

export function useBranches() {
  const repository = useSessionValue((s) => s.repository);
  const revisions = useSessionValue((s) => s.revisions);

  // Shared: several components read branches at once (header, overview
  // column) — one request serves them all.
  return useSharedApiData(
    `branches:${repository?.id ?? "none"}:${revisions.branches}`,
    () =>
      repository === null
        ? Promise.resolve([])
        : listBranches(repository.workspace_id, repository.id),
  );
}
