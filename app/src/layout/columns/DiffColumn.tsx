import { useEffect } from "react";
import { X } from "lucide-react";
import { PatchDiff } from "@pierre/diffs/react";
import { useSession } from "@/features/session";
import { useFileDiff } from "@/features/commits";

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

  return (
    <div className="flex h-full flex-col border-r border-line-subtle bg-canvas">
      <div className="flex flex-none items-center justify-between gap-icon border-b border-line-subtle bg-panel px-row-x py-1">
        <span className="min-w-0 flex-1 truncate font-mono text-caption text-ink" title={diffFile ?? undefined}>
          {diffFile}
        </span>
        <button
          type="button"
          onClick={closeDiff}
          title="Close diff (Esc)"
          className="flex-none rounded-sm p-1 text-ink-faint hover:bg-overlay-hover hover:text-ink"
        >
          <X aria-hidden="true" size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {diff == null ? null : diff.binary || diff.patch == null ? (
          <div className="px-4 py-6 text-center text-caption text-ink-faint">
            Binary file — no diff preview.
          </div>
        ) : (
          <PatchDiff patch={diff.patch} options={{ diffStyle: "split" }} className="h-full" />
        )}
      </div>
    </div>
  );
}
