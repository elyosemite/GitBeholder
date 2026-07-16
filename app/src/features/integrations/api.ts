import { request } from "@/lib/api-client";
import type { ConnectAzureDevOpsPayload, Integration } from "./types";

function basePath(workspaceId: number, repositoryId: number) {
  return `/workspaces/${workspaceId}/repositories/${repositoryId}/integrations/azure-devops`;
}

export async function getAzureDevOpsIntegration(
  workspaceId: number,
  repositoryId: number,
): Promise<Integration | null> {
  try {
    return await request<Integration>(basePath(workspaceId, repositoryId));
  } catch (err) {
    // 404 means "not connected" — a normal state, not a failure.
    if (String(err).includes("404")) return null;
    throw err;
  }
}

export function testAzureDevOpsConnection(
  workspaceId: number,
  repositoryId: number,
  payload: ConnectAzureDevOpsPayload,
): Promise<{ types: unknown[] }> {
  return request(`${basePath(workspaceId, repositoryId)}/test`, {
    method: "POST",
    body: payload,
  });
}

export function connectAzureDevOps(
  workspaceId: number,
  repositoryId: number,
  payload: ConnectAzureDevOpsPayload,
): Promise<Integration> {
  return request(basePath(workspaceId, repositoryId), {
    method: "POST",
    body: payload,
  });
}

export function disconnectAzureDevOps(workspaceId: number, repositoryId: number): Promise<void> {
  return request(basePath(workspaceId, repositoryId), { method: "DELETE" });
}
