import { request } from "@/lib/api-client";

export function pull(
  workspaceId: number,
  repositoryId: number,
): Promise<{ status: string; message: string }> {
  return request(`/workspaces/${workspaceId}/repositories/${repositoryId}/pull`, {
    method: "POST",
  });
}
