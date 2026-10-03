import * as React from "react"

import { useCommitDetails, useCommitFiles, type DiffContext } from "@/features/commits"
import { useSessionActions, useSessionValue } from "@/features/session"
import { ChangedFiles, sortFiles, type FileSort } from "./ChangedFiles"
import { CommitInfo } from "./CommitInfo"
import { FileDiffView } from "./FileDiffView"

/**
 * The bottom panel: the selected commit in two columns. Left: commit
 * metadata on top, its changed files below. Right: the selected file's
 * diff. Replaces the old overview "Inspect" section and middle-column
 * diff view.
 */
export function CommitPanel() {
  const inspectedCommit = useSessionValue((s) => s.inspectedCommit)
  const selectedPath = useSessionValue((s) => s.diffFile)
  const { openDiff } = useSessionActions()
  const { data: details } = useCommitDetails()
  const { data: files } = useCommitFiles()
  const [sort, setSort] = React.useState<FileSort>("path")
  const [context, setContext] = React.useState<DiffContext>(3)

  const sortedFiles = React.useMemo(() => sortFiles(files ?? [], sort), [files, sort])

  // While a new commit's files load, `files` still holds the previous
  // commit's list. Remember which list was on screen when the commit
  // changed; only a different one belongs to the new commit.
  const lastCommitRef = React.useRef(inspectedCommit)
  const filesAtCommitChangeRef = React.useRef(files)
  if (lastCommitRef.current !== inspectedCommit) {
    lastCommitRef.current = inspectedCommit
    filesAtCommitChangeRef.current = files
  }
  const filesAreCurrent = files !== null && files !== filesAtCommitChangeRef.current

  // Selecting a commit shows its first file right away instead of an
  // empty diff column.
  const firstPath = filesAreCurrent ? (sortedFiles[0]?.path ?? null) : null
  React.useEffect(() => {
    if (selectedPath === null && firstPath !== null) openDiff(firstPath)
  }, [selectedPath, firstPath, openDiff])

  if (inspectedCommit === null) {
    return (
      <div className="flex h-full items-center justify-center bg-canvas text-caption text-ink-faint">
        Select a commit to see its details and changes.
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 bg-canvas">
      <div className="flex w-2/5 max-w-xl min-w-0 flex-none flex-col border-r border-line-subtle">
        <div className="max-h-1/2 flex-none overflow-y-auto">
          {/* Skip the previous commit's details while the new ones load. */}
          {details?.hash === inspectedCommit && <CommitInfo details={details} />}
        </div>
        <ChangedFiles
          files={sortedFiles}
          sort={sort}
          onSortChange={setSort}
          selectedPath={selectedPath}
          onSelect={openDiff}
        />
      </div>
      <FileDiffView path={selectedPath} context={context} onContextChange={setContext} />
    </div>
  )
}
