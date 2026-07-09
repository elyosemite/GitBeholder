import { request } from "@/lib/api-client";
import type { FileChange } from "./types";

export function listStatus(
  workspaceId: number,
  repositoryId: number,
): Promise<FileChange[]> {
  return request(`/workspaces/${workspaceId}/repositories/${repositoryId}/status`);
}
