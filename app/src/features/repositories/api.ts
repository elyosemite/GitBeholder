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

export function cloneRepository(
  workspaceId: number,
  url: string,
  destination: string,
): Promise<Repository> {
  return request(`/workspaces/${workspaceId}/repositories/clone`, {
    method: "POST",
    body: { url, destination },
  });
}

/** Most recently opened repositories across workspaces (launcher, startup). */
export function listRecentRepositories(limit = 10): Promise<Repository[]> {
  return request(`/repositories/recent?limit=${limit}`);
}

/** Records that the app opened this repository; it becomes the most recent. */
export function markRepositoryOpened(repository: Repository): Promise<Repository> {
  return request(`/workspaces/${repository.workspace_id}/repositories/${repository.id}/opened`, {
    method: "POST",
  });
}
