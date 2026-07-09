import { request } from "@/lib/api-client";
import type { Branch } from "./types";

export function listBranches(
  workspaceId: number,
  repositoryId: number,
): Promise<Branch[]> {
  return request(`/workspaces/${workspaceId}/repositories/${repositoryId}/branches`);
}
