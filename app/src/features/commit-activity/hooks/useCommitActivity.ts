import { useSession } from "@/features/session";
import { useApiData } from "@/lib/hooks/useApiData";
import { getCommitActivity } from "../api";
import type { CommitActivity } from "../types";

const EMPTY_ACTIVITY: CommitActivity = { buckets: [], truncated: false };

// Same reasoning as useCommitGraph: not keyed on session.revisions, so
// a window-focus refresh never resets this - only date/branch/repo
// changes do.
export function useCommitActivity(startDate: Date | undefined, endDate: Date | undefined) {
  const { repository, branch } = useSession();

  return useApiData(
    () =>
      repository === null || branch === null || startDate === undefined || endDate === undefined
        ? Promise.resolve(EMPTY_ACTIVITY)
        : getCommitActivity(repository.workspace_id, repository.id, branch, startDate, endDate),
    [repository?.id, branch, startDate?.getTime(), endDate?.getTime()],
  );
}
