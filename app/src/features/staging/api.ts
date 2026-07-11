import { request } from "@/lib/api-client";
import type { FileChange } from "./types";

export function listStatus(
  workspaceId: number,
  repositoryId: number,
): Promise<FileChange[]> {
  return request(`/workspaces/${workspaceId}/repositories/${repositoryId}/status`);
}

export function stageFile(
  workspaceId: number,
  repositoryId: number,
  filePath: string,
): Promise<{ status: string; message: string }> {
  return request(`/workspaces/${workspaceId}/repositories/${repositoryId}/stage`, {
    method: "POST",
    body: { file_path: filePath },
  });
}

export function unstageFile(
  workspaceId: number,
  repositoryId: number,
  filePath: string,
): Promise<{ status: string; message: string }> {
  return request(`/workspaces/${workspaceId}/repositories/${repositoryId}/unstage`, {
    method: "POST",
    body: { file_path: filePath },
  });
}
