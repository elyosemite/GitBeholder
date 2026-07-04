import { listCommits } from "../api/client";
import { useApiData } from "../api/useApiData";

interface CommitLogProps {
  workspaceId: number | null;
  repositoryId: number | null;
}

export function CommitLog({ workspaceId, repositoryId }: CommitLogProps) {
  const { data, error, loading } = useApiData(
    () =>
      workspaceId === null || repositoryId === null
        ? Promise.resolve([])
        : listCommits(workspaceId, repositoryId),
    [workspaceId, repositoryId],
  );

  if (workspaceId === null || repositoryId === null) {
    return <div className="empty-state">Select a repository to view its commit log.</div>;
  }

  return (
    <div className="commit-log">
      {loading && <div className="empty-state">Loading commits…</div>}
      {error && <div className="empty-state empty-state--error">{error}</div>}
      {data?.length === 0 && <div className="empty-state">No commits found.</div>}
      {data?.map((commit) => (
        <div key={commit.hash} className="commit-row">
          <span className="commit-row__hash">{commit.hash.slice(0, 7)}</span>
          <span className="commit-row__message">{commit.message}</span>
          <span className="commit-row__author">{commit.author}</span>
          <span className="commit-row__date">{commit.date}</span>
        </div>
      ))}
    </div>
  );
}
