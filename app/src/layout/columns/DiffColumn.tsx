import { useEffect } from "react";
import { X } from "lucide-react";
import { useSession } from "@/features/session";
import { useFileDiff, type DiffLine } from "@/features/commits";

interface PairedRow {
  left: DiffLine | null;
  right: DiffLine | null;
}

// Pairs up adjacent removed/added runs so they render side by side (e.g. a
// 3-line block replaced by a 2-line block yields 3 rows, the 3rd with an
// empty right cell) — context and hunk lines just mirror onto both sides.
function pairLines(lines: DiffLine[]): PairedRow[] {
  const rows: PairedRow[] = [];
  let removedBuffer: DiffLine[] = [];
  let addedBuffer: DiffLine[] = [];

  const flush = () => {
    const max = Math.max(removedBuffer.length, addedBuffer.length);
    for (let i = 0; i < max; i++) {
      rows.push({ left: removedBuffer[i] ?? null, right: addedBuffer[i] ?? null });
    }
    removedBuffer = [];
    addedBuffer = [];
  };

  for (const line of lines) {
    if (line.type === "removed") {
      removedBuffer.push(line);
    } else if (line.type === "added") {
      addedBuffer.push(line);
    } else {
      flush();
      rows.push({ left: line, right: line });
    }
  }
  flush();

  return rows;
}

function DiffLineCell({ line }: { line: DiffLine | null }) {
  if (!line) {
    return <div className="min-w-0 flex-1 bg-line-subtle" />;
  }

  const bg = line.type === "added" ? "bg-success/10" : line.type === "removed" ? "bg-danger/10" : "";
  const lineNumber = line.new_line ?? line.old_line;

  return (
    <div className={"flex min-w-0 flex-1 items-start gap-icon px-2 " + bg}>
      <span className="w-8 flex-none text-right font-mono text-meta text-ink-faint">
        {lineNumber ?? ""}
      </span>
      <span className="min-w-0 flex-1 whitespace-pre font-mono text-caption text-ink">
        {line.content}
      </span>
    </div>
  );
}

export function DiffColumn() {
  const { diffFile, closeDiff } = useSession();
  const { data: diff } = useFileDiff();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeDiff();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeDiff]);

  const rows = diff && !diff.binary ? pairLines(diff.lines) : [];

  return (
    <div className="flex h-full flex-col border-r border-line-subtle bg-canvas">
      <div className="flex flex-none items-center justify-between gap-icon border-b border-line-subtle bg-panel px-row-x py-1">
        <span className="min-w-0 flex-1 truncate font-mono text-caption text-ink" title={diffFile ?? undefined}>
          {diffFile}
        </span>
        <button
          type="button"
          onClick={closeDiff}
          title="Fechar diff (Esc)"
          className="flex-none rounded-sm p-1 text-ink-faint hover:bg-overlay-hover hover:text-ink"
        >
          <X aria-hidden="true" size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {diff?.binary ? (
          <div className="px-4 py-6 text-center text-caption text-ink-faint">
            Arquivo binário — sem preview de diff.
          </div>
        ) : (
          rows.map((row, index) =>
            row.left?.type === "hunk" ? (
              <div key={index} className="bg-surface px-2 py-0.5 font-mono text-meta text-ink-faint">
                {row.left.content}
              </div>
            ) : (
              <div key={index} className="flex">
                <DiffLineCell line={row.left} />
                <div className="w-px flex-none bg-line-subtle" />
                <DiffLineCell line={row.right} />
              </div>
            ),
          )
        )}
      </div>
    </div>
  );
}
