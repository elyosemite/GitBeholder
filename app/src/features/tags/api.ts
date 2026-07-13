import { request } from "@/lib/api-client";
import type { Tag } from "./types";

export function listTags(
  workspaceId: number,
  repositoryId: number,
): Promise<Tag[]> {
  return request(`/workspaces/${workspaceId}/repositories/${repositoryId}/tags`);
}
