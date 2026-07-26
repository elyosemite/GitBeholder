import { request } from "@/lib/api-client";
import type { CommitGraph } from "./types";

function toDateParam(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getCommitGraph(
  workspaceId: number,
  repositoryId: number,
  branch: string,
  startDate: Date,
  endDate: Date,
): Promise<CommitGraph> {
  const params = new URLSearchParams({
    branch,
    start_date: toDateParam(startDate),
    end_date: toDateParam(endDate),
  });

  return request(
    `/workspaces/${workspaceId}/repositories/${repositoryId}/commit-graph?${params.toString()}`,
  );
}
