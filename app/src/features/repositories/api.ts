import { request } from "@/lib/api-client";
import type { Repository, Workspace } from "./types";

export function listWorkspaces(): Promise<{ workspaces: Workspace[] }> {
  return request("/workspaces");
}

export function listRepositories(
  workspaceId: number,
): Promise<{ repositories: Repository[] }> {
  return request(`/workspaces/${workspaceId}/repositories`);
}
