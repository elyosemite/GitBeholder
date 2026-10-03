import { request } from "@/lib/api-client";
import type { Commit, CommitDetails, CommitFileChange, DiffContext, FileDiff } from "./types";

export function listCommits(
  workspaceId: number,
  repositoryId: number,
  branch: string,
): Promise<Commit[]> {
  return request(
    `/workspaces/${workspaceId}/repositories/${repositoryId}/commits?branch=${encodeURIComponent(branch)}`,
  );
}

export function getCommitFiles(
  workspaceId: number,
  repositoryId: number,
  hash: string,
): Promise<CommitFileChange[]> {
  return request(
    `/workspaces/${workspaceId}/repositories/${repositoryId}/commits/${hash}/files`,
  );
}

export function getCommitDetails(
  workspaceId: number,
  repositoryId: number,
  hash: string,
): Promise<CommitDetails> {
  return request(`/workspaces/${workspaceId}/repositories/${repositoryId}/commits/${hash}`);
}

export function getFileDiff(
  workspaceId: number,
  repositoryId: number,
  hash: string,
  path: string,
  context: DiffContext = 3,
): Promise<FileDiff> {
  return request(
    `/workspaces/${workspaceId}/repositories/${repositoryId}/commits/${hash}/diff?path=${encodeURIComponent(path)}&context=${context}`,
  );
}

export function createCommit(
  workspaceId: number,
  repositoryId: number,
  message: string,
): Promise<{ status: string; message: string }> {
  return request(`/workspaces/${workspaceId}/repositories/${repositoryId}/commit`, {
    method: "POST",
    body: { message },
  });
}
