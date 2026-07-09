import { request } from "@/lib/api-client";
import type { Commit } from "./types";

export function listCommits(
  workspaceId: number,
  repositoryId: number,
  branch: string,
): Promise<Commit[]> {
  return request(
    `/workspaces/${workspaceId}/repositories/${repositoryId}/commits?branch=${encodeURIComponent(branch)}`,
  );
}
