import { listRepositories } from "../api/client";
import { useApiData } from "../api/useApiData";
import type { Repository } from "../api/types";

interface RepositoryListProps {
  workspaceId: number | null;
  selectedId: number | null;
  onSelect: (repository: Repository) => void;
}

export function RepositoryList({
  workspaceId,
  selectedId,
  onSelect,
}: RepositoryListProps) {
  const { data, error, loading } = useApiData(
    () =>
      workspaceId === null
        ? Promise.resolve([])
        : listRepositories(workspaceId).then((r) => r.repositories),
    [workspaceId],
  );

  if (workspaceId === null) return null;

  return (
    <div className="sidebar-section">
      <div className="sidebar-section__title">Repositories</div>
      {loading && <div className="sidebar-hint">Loading…</div>}
      {error && <div className="sidebar-error">{error}</div>}
      {data?.length === 0 && <div className="sidebar-hint">No repositories yet</div>}
      {data?.map((repository) => (
        <button
          key={repository.id}
          className={
            "sidebar-item" + (selectedId === repository.id ? " sidebar-item--active" : "")
          }
          onClick={() => onSelect(repository)}
          title={repository.path}
        >
          {repository.name}
        </button>
      ))}
    </div>
  );
}
