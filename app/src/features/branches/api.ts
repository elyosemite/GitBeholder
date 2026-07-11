import { request } from "@/lib/api-client";
import type { Branch } from "./types";

export function listBranches(
  workspaceId: number,
  repositoryId: number,
): Promise<Branch[]> {
  return request(`/workspaces/${workspaceId}/repositories/${repositoryId}/branches`);
}

export function checkoutBranch(
  workspaceId: number,
  repositoryId: number,
  name: string,
): Promise<{ status: string; message: string }> {
  return request(`/workspaces/${workspaceId}/repositories/${repositoryId}/branches/checkout`, {
    method: "POST",
    body: { name },
  });
}
