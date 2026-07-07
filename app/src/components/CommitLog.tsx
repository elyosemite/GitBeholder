import { listCommits } from "../api/client";
import { useApiData } from "../api/useApiData";

interface CommitLogProps {
  workspaceId: number | null;
  repositoryId: number | null;
}

const EMPTY_STATE_BASE = "px-4 py-6 text-[12.5px] text-center";

export function CommitLog({ workspaceId, repositoryId }: CommitLogProps) {
  const { data, error, loading } = useApiData(
    () =>
      workspaceId === null || repositoryId === null
        ? Promise.resolve([])
        : listCommits(workspaceId, repositoryId),
    [workspaceId, repositoryId],
  );

  if (workspaceId === null || repositoryId === null) {
    return <div className={EMPTY_STATE_BASE + " text-ink-faint"}>Select a repository to view its commit log.</div>;
  }

  return (
    <div className="flex flex-col">
      {loading && <div className={EMPTY_STATE_BASE + " text-ink-faint"}>Loading commits…</div>}
      {error && <div className={EMPTY_STATE_BASE + " text-danger"}>{error}</div>}
      {data?.length === 0 && <div className={EMPTY_STATE_BASE + " text-ink-faint"}>No commits found.</div>}
      {data?.map((commit) => (
        <div
          key={commit.hash}
          className="flex items-center gap-[14px] h-10 px-4 border-b border-line-subtle hover:bg-overlay-hover"
        >
          <span className="flex-none w-[70px] font-mono text-[11.5px] text-ink-faint">
            {commit.hash.slice(0, 7)}
          </span>
          <span className="flex-1 min-w-0 text-[13px] overflow-hidden text-ellipsis whitespace-nowrap">
            {commit.message}
          </span>
          <span className="flex-none w-[140px] text-xs text-ink-secondary overflow-hidden text-ellipsis whitespace-nowrap">
            {commit.author}
          </span>
          <span className="flex-none w-24 text-right text-[11.5px] text-ink-faint font-mono">
            {commit.date}
          </span>
        </div>
      ))}
    </div>
  );
}
