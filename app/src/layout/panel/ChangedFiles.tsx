import { ArrowDownUp } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { CommitFileChange, FileStatus } from "@/features/commits"
import { splitPath } from "@/lib/paths"

export type FileSort = "path" | "path-desc" | "name" | "name-desc" | "status"

export const FILE_SORT_LABELS: Record<FileSort, string> = {
  path: "Path Alphabetically",
  "path-desc": "Path Alphabetically (Reverse)",
  name: "File Name Alphabetically",
  "name-desc": "File Name Alphabetically (Reverse)",
  status: "File Status",
}

// Additions first, deletions last; ties fall back to the path.
const STATUS_ORDER: Record<FileStatus, number> = { A: 0, M: 1, R: 2, C: 3, T: 4, D: 5 }

const STATUS_STYLES: Record<FileStatus, string> = {
  A: "text-success",
  M: "text-accent-text",
  R: "text-accent-text",
  C: "text-accent-text",
  T: "text-ink-secondary",
  D: "text-danger",
}

const STATUS_LABELS: Record<FileStatus, string> = {
  A: "Added",
  M: "Modified",
  R: "Renamed",
  C: "Copied",
  T: "Type changed",
  D: "Deleted",
}

export function sortFiles(files: CommitFileChange[], sort: FileSort): CommitFileChange[] {
  const byPath = (a: CommitFileChange, b: CommitFileChange) => a.path.localeCompare(b.path)
  const byName = (a: CommitFileChange, b: CommitFileChange) =>
    splitPath(a.path).name.localeCompare(splitPath(b.path).name) || byPath(a, b)

  const sorted = [...files]
  switch (sort) {
    case "path":
      return sorted.sort(byPath)
    case "path-desc":
      return sorted.sort((a, b) => byPath(b, a))
    case "name":
      return sorted.sort(byName)
    case "name-desc":
      return sorted.sort((a, b) => byName(b, a))
    case "status":
      return sorted.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || byPath(a, b))
  }
}

// Bottom block of the panel's first column: the commit's changed files,
// with a header to sort them.
export function ChangedFiles({
  files,
  sort,
  onSortChange,
  selectedPath,
  onSelect,
}: {
  files: CommitFileChange[]
  sort: FileSort
  onSortChange: (sort: FileSort) => void
  selectedPath: string | null
  onSelect: (path: string) => void
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-control flex-none items-center justify-between gap-2 border-y border-line-subtle bg-panel px-row-x">
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Sort files"
            className="flex h-control-sm min-w-0 items-center gap-1.5 rounded-sm px-1.5 text-caption text-ink-secondary outline-none hover:bg-overlay-hover hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ArrowDownUp aria-hidden="true" className="size-icon-xs flex-none" />
            <span className="truncate">{FILE_SORT_LABELS[sort]}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-auto">
            <DropdownMenuRadioGroup value={sort} onValueChange={(value) => onSortChange(value as FileSort)}>
              {(Object.keys(FILE_SORT_LABELS) as FileSort[]).map((option) => (
                <DropdownMenuRadioItem key={option} value={option}>
                  {FILE_SORT_LABELS[option]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="flex-none text-caption text-ink-faint">
          {files.length} {files.length === 1 ? "file" : "files"}
        </span>
      </div>

      <ul aria-label="Changed files" className="min-h-0 flex-1 overflow-auto py-1">
        {files.map((file) => {
          const { name, dir } = splitPath(file.path)
          const selected = file.path === selectedPath
          return (
            <li key={file.path}>
              <button
                type="button"
                aria-current={selected || undefined}
                onClick={() => onSelect(file.path)}
                title={file.path}
                className={
                  "flex h-row w-full items-center gap-icon px-row-x text-left text-row outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset " +
                  (selected ? "bg-accent-soft" : "hover:bg-overlay-hover")
                }
              >
                <span
                  title={STATUS_LABELS[file.status]}
                  className={"w-3.5 flex-none text-center font-mono font-semibold " + STATUS_STYLES[file.status]}
                >
                  {file.status}
                </span>
                <span className="flex min-w-0 flex-1 items-baseline gap-icon">
                  <span className="flex-none text-ink">{name}</span>
                  {dir && <span className="min-w-0 flex-1 truncate text-caption text-ink-faint">{dir}</span>}
                </span>
                <span className="flex flex-none items-center gap-1.5 font-mono text-caption">
                  {file.additions ? <span className="text-success">+{file.additions}</span> : null}
                  {file.deletions ? <span className="text-danger">-{file.deletions}</span> : null}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
