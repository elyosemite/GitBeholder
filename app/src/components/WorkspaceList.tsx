import { listWorkspaces } from "../api/client";
import { useApiData } from "../api/useApiData";
import type { Workspace } from "../api/types";

interface WorkspaceListProps {
  selectedId: number | null;
  onSelect: (workspace: Workspace) => void;
}

export function WorkspaceList({ selectedId, onSelect }: WorkspaceListProps) {
  const { data, error, loading } = useApiData(
    () => listWorkspaces().then((r) => r.workspaces),
    [],
  );

  return (
    <div className="sidebar-section">
      <div className="sidebar-section__title">Workspaces</div>
      {loading && <div className="sidebar-hint">Loading…</div>}
      {error && <div className="sidebar-error">{error}</div>}
      {data?.length === 0 && <div className="sidebar-hint">No workspaces yet</div>}
      {data?.map((workspace) => (
        <button
          key={workspace.id}
          className={
            "sidebar-item" + (selectedId === workspace.id ? " sidebar-item--active" : "")
          }
          onClick={() => onSelect(workspace)}
        >
          {workspace.name}
        </button>
      ))}
    </div>
  );
}
