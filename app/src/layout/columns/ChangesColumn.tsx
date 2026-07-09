import { PanelEmpty, PanelSection } from "@/components/panel-primitives";
import { useStatus, type FileStatus } from "@/features/staging";

const STATUS_STYLES: Record<FileStatus, string> = {
  M: "text-accent",
  A: "text-success",
  D: "text-danger",
  U: "text-ink-faint",
};

function FileRow({ path, status }: { path: string; status: FileStatus }) {
  return (
    <div className="flex items-center gap-icon text-row">
      <span className={"w-3.5 flex-none text-center font-mono font-semibold " + STATUS_STYLES[status]}>
        {status}
      </span>
      <span className="truncate text-ink-secondary" title={path}>
        {path}
      </span>
    </div>
  );
}

export function ChangesColumn() {
  const { data: files } = useStatus();
  const rows = files ?? [];
  const unstagedFiles = rows.filter((file) => !file.staged);
  const stagedFiles = rows.filter((file) => file.staged);

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-panel">
      {/* <ColumnHeader title="Changes" /> */}
      <div className="flex flex-1 flex-col">
          <PanelSection title="Unstaged Files">
            {unstagedFiles.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {unstagedFiles.map((file) => (
                  <FileRow key={file.path} path={file.path} status={file.status} />
                ))}
              </div>
            ) : (
              <PanelEmpty>Nenhuma alteração.</PanelEmpty>
            )}
          </PanelSection>

          <PanelSection title="Staged Files">
            {stagedFiles.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {stagedFiles.map((file) => (
                  <FileRow key={file.path} path={file.path} status={file.status} />
                ))}
              </div>
            ) : (
              <PanelEmpty>Nada staged.</PanelEmpty>
            )}
          </PanelSection>

          <div className="mt-auto px-panel-x py-panel-y">
            <textarea
              disabled
              rows={3}
              placeholder="Mensagem do commit…"
              className="w-full resize-none rounded-lg border border-line-default bg-surface px-2 py-2 text-row text-ink placeholder:text-ink-faint outline-none disabled:opacity-60"
            />
            <button
              disabled
              className="mt-2 w-full rounded-lg bg-accent-soft px-2 py-2 text-row font-semibold text-accent disabled:opacity-50"
            >
              Commit
            </button>
        </div>
      </div>
    </div>
  );
}
