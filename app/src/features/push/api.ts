import { request } from "@/lib/api-client";
import type { PushStatus } from "./types";

export function getPushStatus(
  workspaceId: number,
  repositoryId: number,
): Promise<PushStatus> {
  return request(`/workspaces/${workspaceId}/repositories/${repositoryId}/push/status`);
}

export function push(
  workspaceId: number,
  repositoryId: number,
): Promise<{ status: string; message: string }> {
  return request(`/workspaces/${workspaceId}/repositories/${repositoryId}/push`, {
    method: "POST",
  });
}
