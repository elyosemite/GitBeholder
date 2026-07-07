import { listWorkspaces } from "../api/client";
import { useApiData } from "../api/useApiData";
import type { Workspace } from "../api/types";

interface WorkspaceListProps {
  selectedId: number | null;
  onSelect: (workspace: Workspace) => void;
}

const ITEM_BASE =
  "block w-full text-left rounded-[7px] py-1.5 px-[9px] my-px text-[12.5px] font-sans cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis";
const ITEM_DEFAULT = "text-ink hover:bg-surface";
const ITEM_ACTIVE = "bg-accent-soft text-accent font-semibold";

export function WorkspaceList({ selectedId, onSelect }: WorkspaceListProps) {
  const { data, error, loading } = useApiData(
    () => listWorkspaces().then((r) => r.workspaces),
    [],
  );

  return (
    <div className="mb-4">
      <div className="text-[10.5px] font-bold tracking-[0.08em] uppercase text-ink-faint py-1 px-2">
        Workspaces
      </div>
      {loading && <div className="text-[11.5px] text-ink-faint py-1 px-[9px]">Loading…</div>}
      {error && <div className="text-[11.5px] text-danger py-1 px-[9px]">{error}</div>}
      {data?.length === 0 && (
        <div className="text-[11.5px] text-ink-faint py-1 px-[9px]">No workspaces yet</div>
      )}
      {data?.map((workspace) => (
        <button
          key={workspace.id}
          className={ITEM_BASE + " " + (selectedId === workspace.id ? ITEM_ACTIVE : ITEM_DEFAULT)}
          onClick={() => onSelect(workspace)}
        >
          {workspace.name}
        </button>
      ))}
    </div>
  );
}
