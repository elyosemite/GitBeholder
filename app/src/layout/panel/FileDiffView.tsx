import { FileCode2, ListCollapse } from "lucide-react"
import { PatchDiff } from "@pierre/diffs/react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DIFF_CONTEXT_OPTIONS, useFileDiff, type DiffContext } from "@/features/commits"

function contextLabel(lines: DiffContext) {
  return `${lines} ${lines === 1 ? "line" : "lines"} of context`
}

/**
 * Second column of the panel: the selected file's changes, unified, with
 * only `context` unchanged lines around each change — in a 1000-line file
 * with 50 changes you see the changes, not the 1000 lines. Scrolls both
 * ways so long lines and long diffs stay readable.
 */
export function FileDiffView({
  path,
  context,
  onContextChange,
}: {
  path: string | null
  context: DiffContext
  onContextChange: (context: DiffContext) => void
}) {
  const { data: diff, loading } = useFileDiff(context)

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex h-control flex-none items-center gap-icon border-b border-line-subtle bg-panel px-row-x">
        <FileCode2 aria-hidden="true" className="size-icon-sm flex-none text-ink-secondary" />
        <span className="min-w-0 flex-1 truncate font-mono text-caption text-ink" title={path ?? undefined}>
          {path ?? "No file selected"}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Context lines"
            className="flex h-control-sm flex-none items-center gap-1.5 rounded-sm px-1.5 text-caption text-ink-secondary outline-none hover:bg-overlay-hover hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ListCollapse aria-hidden="true" className="size-icon-xs flex-none" />
            {contextLabel(context)}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-auto">
            <DropdownMenuLabel>Unchanged lines around each change</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={String(context)}
              onValueChange={(value) => onContextChange(Number(value) as DiffContext)}
            >
              {DIFF_CONTEXT_OPTIONS.map((lines) => (
                <DropdownMenuRadioItem key={lines} value={String(lines)}>
                  {lines}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-canvas">
        {path === null ? (
          <p className="p-panel-x text-caption text-ink-faint">Select a file to see its changes.</p>
        ) : diff === null ? (
          loading && <p className="p-panel-x text-caption text-ink-faint">Loading diff…</p>
        ) : diff.binary || diff.patch === null ? (
          <p className="p-panel-x text-caption text-ink-faint">Binary file — no diff preview.</p>
        ) : (
          <PatchDiff
            patch={diff.patch}
            options={{ diffStyle: "unified", overflow: "scroll", disableFileHeader: true }}
          />
        )}
      </div>
    </div>
  )
}
