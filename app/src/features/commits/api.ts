import { request } from "@/lib/api-client";
import type { Commit } from "./types";

export function listCommits(
  workspaceId: number,
  repositoryId: number,
  limit = 20,
): Promise<Commit[]> {
  return request(
    `/workspaces/${workspaceId}/repositories/${repositoryId}/log?limit=${limit}`,
  );
}
