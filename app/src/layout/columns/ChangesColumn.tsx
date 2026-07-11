import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { PanelEmpty, PanelSection } from "@/components/panel-primitives";
import { useCreateCommit } from "@/features/commits";
import { useStagingActions, useStatus, type FileStatus } from "@/features/staging";

const STATUS_STYLES: Record<FileStatus, string> = {
  M: "text-accent",
  A: "text-success",
  D: "text-danger",
  U: "text-ink-faint",
};

function splitPath(path: string) {
  const slash = path.lastIndexOf("/");
  return slash === -1
    ? { name: path, dir: "" }
    : { name: path.slice(slash + 1), dir: path.slice(0, slash) };
}

function FileRow({
  path,
  status,
  staged,
  onToggleStage,
}: {
  path: string;
  status: FileStatus;
  staged: boolean;
  onToggleStage: (path: string, staged: boolean) => void;
}) {
  const { name, dir } = splitPath(path);
  const ToggleIcon = staged ? Minus : Plus;

  return (
    <div className="group flex items-center gap-icon rounded-md text-row hover:bg-overlay-hover">
      <span className={"w-3.5 flex-none text-center font-mono font-semibold " + STATUS_STYLES[status]}>
        {status}
      </span>
      <span className="flex min-w-0 flex-1 items-baseline gap-icon" title={path}>
        <span className="flex-none text-ink">{name}</span>
        {dir && <span className="min-w-0 flex-1 truncate text-ink-faint">{dir}</span>}
      </span>
      <button
        type="button"
        onClick={() => onToggleStage(path, staged)}
        title={staged ? "Mover para Unstaged" : "Mover para Staged"}
        className="flex-none rounded-sm p-0.5 text-ink-faint opacity-0 outline-none transition-opacity hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
      >
        <ToggleIcon aria-hidden="true" size={14} />
      </button>
    </div>
  );
}

export function ChangesColumn() {
  const { data: files } = useStatus();
  const { stage, unstage } = useStagingActions();
  const createCommit = useCreateCommit();
  const rows = files ?? [];
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState("");
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitError, setCommitError] = useState<string | null>(null);

  // Once a fresh status list lands, it's the source of truth — drop any
  // optimistic guesses instead of letting them linger past a failed call.
  useEffect(() => {
    if (files) setOverrides({});
  }, [files]);

  const toggleStage = (path: string, staged: boolean) => {
    setOverrides((prev) => ({ ...prev, [path]: !staged }));
    void (staged ? unstage(path) : stage(path));
  };

  const resolvedRows = rows.map((file) => ({
    ...file,
    staged: overrides[file.path] ?? file.staged,
  }));

  const unstagedFiles = resolvedRows.filter((file) => !file.staged);
  const stagedFiles = resolvedRows.filter((file) => file.staged);
  const canCommit = message.trim() !== "" && stagedFiles.length > 0 && !isCommitting;

  const handleCommit = async () => {
    setIsCommitting(true);
    setCommitError(null);
    try {
      await createCommit(message.trim());
      setMessage("");
    } catch (err) {
      setCommitError(String(err));
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-panel">
      {/* <ColumnHeader title="Changes" /> */}
      <div className="flex flex-1 flex-col">
          <PanelSection title="Unstaged Files">
            {unstagedFiles.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {unstagedFiles.map((file) => (
                  <FileRow
                    key={file.path}
                    path={file.path}
                    status={file.status}
                    staged={file.staged}
                    onToggleStage={toggleStage}
                  />
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
                  <FileRow
                    key={file.path}
                    path={file.path}
                    status={file.status}
                    staged={file.staged}
                    onToggleStage={toggleStage}
                  />
                ))}
              </div>
            ) : (
              <PanelEmpty>Nada staged.</PanelEmpty>
            )}
          </PanelSection>

          <div className="mt-auto px-panel-x py-panel-y">
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              disabled={isCommitting}
              rows={3}
              placeholder="Mensagem do commit…"
              className="w-full resize-none rounded-lg border border-line-default bg-surface px-2 py-2 text-row text-ink placeholder:text-ink-faint outline-none disabled:opacity-60"
            />
            {commitError && <p className="mt-1 text-caption text-danger">{commitError}</p>}
            <button
              type="button"
              onClick={() => void handleCommit()}
              disabled={!canCommit}
              className="mt-2 w-full rounded-lg bg-accent-soft px-2 py-2 text-row font-semibold text-accent disabled:opacity-50"
            >
              Commit
            </button>
        </div>
      </div>
    </div>
  );
}
