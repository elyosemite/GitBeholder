import { request } from "@/lib/api-client";
import type { Stash } from "./types";

export function listStashes(
  workspaceId: number,
  repositoryId: number,
): Promise<Stash[]> {
  return request(`/workspaces/${workspaceId}/repositories/${repositoryId}/stashes`);
}
