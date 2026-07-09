import { PanelSection } from "@/components/panel-primitives";

type FileStatus = "M" | "A" | "D" | "U";

const STATUS_STYLES: Record<FileStatus, string> = {
  M: "text-accent",
  A: "text-success",
  D: "text-danger",
  U: "text-ink-faint",
};

const UNSTAGED_FILES: { path: string; status: FileStatus }[] = [
  { path: "src/components/Header.tsx", status: "M" },
  { path: "src/App.css", status: "M" },
  { path: "src/lib/utils.ts", status: "U" },
];

const STAGED_FILES: { path: string; status: FileStatus }[] = [
  { path: "src/components/RepositoryOverviewColumn.tsx", status: "A" },
  { path: "src/components/ChangesColumn.tsx", status: "A" },
];

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
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-panel">
      {/* <ColumnHeader title="Changes" /> */}
      <div className="flex flex-1 flex-col">
          <PanelSection title="Unstaged Files">
            <div className="flex flex-col gap-1.5">
              {UNSTAGED_FILES.map((file) => (
                <FileRow key={file.path} {...file} />
              ))}
            </div>
          </PanelSection>

          <PanelSection title="Staged Files">
            <div className="flex flex-col gap-1.5">
              {STAGED_FILES.map((file) => (
                <FileRow key={file.path} {...file} />
              ))}
            </div>
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
