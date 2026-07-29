import { request } from "@/lib/api-client";
import type { CommitActivity } from "./types";

function toDateParam(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getCommitActivity(
  workspaceId: number,
  repositoryId: number,
  branch: string,
  startDate: Date,
  endDate: Date,
): Promise<CommitActivity> {
  const params = new URLSearchParams({
    branch,
    start_date: toDateParam(startDate),
    end_date: toDateParam(endDate),
  });

  return request(
    `/workspaces/${workspaceId}/repositories/${repositoryId}/commit-activity?${params.toString()}`,
  );
}
