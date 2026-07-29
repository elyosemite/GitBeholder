import { useSession } from "@/features/session";
import { useApiData } from "@/lib/hooks/useApiData";
import { getCommitGraph } from "../api";
import type { CommitGraph } from "../types";

const EMPTY_GRAPH: CommitGraph = { nodes: [], edges: [], truncated: false };

// Deliberately not keyed on session.revisions (unlike useCommits/
// useBranches/etc.) - the graph is expensive to lay out and shouldn't
// reset/refetch just because the window regained focus and bumped
// "status"/"branches"/"sync"/"stashes"/"tags". Only a repository/branch
// switch or an actual date-range change should trigger a new fetch.
export function useCommitGraph(startDate: Date | undefined, endDate: Date | undefined) {
  const { repository, branch } = useSession();

  return useApiData(
    () =>
      repository === null || branch === null || startDate === undefined || endDate === undefined
        ? Promise.resolve(EMPTY_GRAPH)
        : getCommitGraph(repository.workspace_id, repository.id, branch, startDate, endDate),
    [repository?.id, branch, startDate?.getTime(), endDate?.getTime()],
  );
}
