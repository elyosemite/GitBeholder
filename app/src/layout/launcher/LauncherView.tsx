import * as React from "react"
import { FolderGit2, FolderOpen, GitBranchPlus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useRecentRepositories, type Repository } from "@/features/repositories"
import { useSessionActions } from "@/features/session"
import { formatRelativeTime } from "@/lib/formatRelativeTime"
import { CloneRepositoryDialog } from "../header/CloneRepositoryDialog"
import { OpenLocalRepositoryDialog } from "../header/OpenLocalRepositoryDialog"

const RECENT_LIMIT = 10

/**
 * The "new tab" screen, spanning all three columns: pick one of the most
 * recently opened repositories, or open/clone another. Choosing one turns
 * this tab into that repository's tab (see features/tabs).
 */
export function LauncherView() {
  const { data: repositories, loading, error } = useRecentRepositories(RECENT_LIMIT)
  const { selectRepository } = useSessionActions()
  const [isOpenLocalOpen, setIsOpenLocalOpen] = React.useState(false)
  const [isCloneOpen, setIsCloneOpen] = React.useState(false)

  React.useEffect(() => {
    if (error) toast.error("Couldn't load recent repositories", { description: error })
  }, [error])

  const list = repositories ?? []

  return (
    <div className="flex h-full items-center justify-center overflow-y-auto bg-canvas p-8">
      <div className="flex w-full max-w-lg flex-col gap-6">
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-display text-ink">Open a repository</h1>
          <p className="text-caption text-ink-faint">
            {list.length > 0 ? "Pick up where you left off." : "Add a repository to get started."}
          </p>
        </div>

        {loading && list.length === 0 ? (
          <p className="text-center text-caption text-ink-faint">Loading recent repositories…</p>
        ) : list.length > 0 ? (
          <ul aria-label="Recent repositories" className="flex flex-col gap-1 rounded-lg border border-line-subtle bg-panel p-1 shadow-sm">
            {list.map((repository) => (
              <li key={repository.id}>
                <RecentRepositoryRow repository={repository} onOpen={selectRepository} />
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex justify-center gap-2">
          <Button type="button" variant="outline" onClick={() => setIsOpenLocalOpen(true)}>
            <FolderOpen />
            Open local repository…
          </Button>
          <Button type="button" variant="outline" onClick={() => setIsCloneOpen(true)}>
            <GitBranchPlus />
            Clone repository…
          </Button>
        </div>
      </div>

      <OpenLocalRepositoryDialog open={isOpenLocalOpen} onOpenChange={setIsOpenLocalOpen} />
      <CloneRepositoryDialog open={isCloneOpen} onOpenChange={setIsCloneOpen} />
    </div>
  )
}

function RecentRepositoryRow({
  repository,
  onOpen,
}: {
  repository: Repository
  onOpen: (repository: Repository) => void
}) {
  const openedAt = repository.last_opened_at
    ? formatRelativeTime(new Date(repository.last_opened_at))
    : "Never opened"

  return (
    <button
      type="button"
      onClick={() => onOpen(repository)}
      title={repository.path}
      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left outline-none transition-colors hover:bg-overlay-hover focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <FolderGit2 aria-hidden="true" className="size-icon-md flex-none text-accent" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-row font-medium text-ink">{repository.name}</span>
        <span className="truncate font-mono text-caption text-ink-faint">{repository.path}</span>
      </span>
      <span className="flex-none text-caption text-ink-faint">{openedAt}</span>
    </button>
  )
}
