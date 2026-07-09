import { CommitLog } from "./CommitLog";
import { ColumnHeader } from "./panel-primitives";

interface CommitsColumnProps {
  workspaceId: number | null;
  repositoryId: number | null;
}

export function CommitsColumn({ workspaceId, repositoryId }: CommitsColumnProps) {
  return (
    <div className="flex h-full flex-col overflow-y-auto border-r border-line-subtle bg-canvas">
      <ColumnHeader title="Commits" />
      <CommitLog workspaceId={workspaceId} repositoryId={repositoryId} />
    </div>
  );
}
