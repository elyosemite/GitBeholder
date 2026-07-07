import { listRepositories } from "../api/client";
import { useApiData } from "../api/useApiData";
import type { Repository } from "../api/types";

interface RepositoryListProps {
  workspaceId: number | null;
  selectedId: number | null;
  onSelect: (repository: Repository) => void;
}

const ITEM_BASE =
  "block w-full text-left rounded-[7px] py-1.5 px-[9px] my-px text-[12.5px] font-sans cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis";
const ITEM_DEFAULT = "text-ink hover:bg-surface";
const ITEM_ACTIVE = "bg-accent-soft text-accent font-semibold";

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
    <div className="mb-4">
      <div className="text-[10.5px] font-bold tracking-[0.08em] uppercase text-ink-faint py-1 px-2">
        Repositories
      </div>
      {loading && <div className="text-[11.5px] text-ink-faint py-1 px-[9px]">Loading…</div>}
      {error && <div className="text-[11.5px] text-danger py-1 px-[9px]">{error}</div>}
      {data?.length === 0 && (
        <div className="text-[11.5px] text-ink-faint py-1 px-[9px]">No repositories yet</div>
      )}
      {data?.map((repository) => (
        <button
          key={repository.id}
          className={ITEM_BASE + " " + (selectedId === repository.id ? ITEM_ACTIVE : ITEM_DEFAULT)}
          onClick={() => onSelect(repository)}
          title={repository.path}
        >
          {repository.name}
        </button>
      ))}
    </div>
  );
}
