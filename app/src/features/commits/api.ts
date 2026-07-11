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

export function createCommit(
  workspaceId: number,
  repositoryId: number,
  message: string,
): Promise<{ status: string; message: string }> {
  return request(`/workspaces/${workspaceId}/repositories/${repositoryId}/commit`, {
    method: "POST",
    body: { message },
  });
}
