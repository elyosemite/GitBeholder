import { useSessionValue } from "@/features/session";
import { useSharedApiData } from "@/lib/hooks/useSharedApiData";
import { getCommitDetails } from "../api";

/**
 * Metadata of a commit — `hash`, or the selected commit when omitted.
 * Shared by key, so the panel and a hover card on the same commit make
 * one request.
 */
export function useCommitDetails(hash?: string) {
  const repository = useSessionValue((s) => s.repository);
  const inspectedCommit = useSessionValue((s) => s.inspectedCommit);
  const target = hash ?? inspectedCommit;

  return useSharedApiData(`commit:${repository?.id ?? "none"}:${target ?? "none"}`, () =>
    repository === null || target === null
      ? Promise.resolve(null)
      : getCommitDetails(repository.workspace_id, repository.id, target),
  );
}
