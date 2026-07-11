import { request } from "@/lib/api-client";
import type { Repository, Workspace } from "./types";

export function listWorkspaces(): Promise<{ workspaces: Workspace[] }> {
  return request("/workspaces");
}

export function listRepositories(workspaceId: number): Promise<Repository[]> {
  return request(`/workspaces/${workspaceId}/repositories`);
}

export function openLocalRepository(
  workspaceId: number,
  path: string,
): Promise<Repository> {
  return request(`/workspaces/${workspaceId}/repositories/open-local`, {
    method: "POST",
    body: { path },
  });
}
