import * as React from "react"
import { Check, Clock, Cloud, Copy, GitBranch, GitCommitVertical, Target, User } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { useCommitDetails, type CommitBranch, type CommitDetails, type CommitStats } from "@/features/commits"
import { useUsersByEmail } from "@/features/users"
import { authorColor, authorInitials } from "@/lib/authorColor"
import { formatRelativeTime } from "@/lib/formatRelativeTime"

// Long enough that sweeping the mouse across the list opens nothing; the
// close delay leaves time to move into the card to select or copy text.
const OPEN_DELAY_MS = 700
const CLOSE_DELAY_MS = 250

// Gap between the pointer and the card's top-left corner.
const POINTER_OFFSET_PX = 8

// "October 3, 2026 at 12:53 PM"
const DATE_FORMAT = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeStyle: "short" })

/**
 * Wraps a commit row: resting the pointer on it opens an interactive card
 * with the commit's author, co-authors, message, stats, branches and hash.
 * Details are fetched only once the card opens.
 */
export function CommitHoverCard({
  hash,
  trigger,
  children,
}: {
  hash: string
  /** The row element the card is anchored to (rendered as the trigger). */
  trigger: React.ReactElement
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  // Where the pointer rests on the row. Tracked only while closed: once
  // open, the card stays put so the pointer can travel into it.
  const pointerRef = React.useRef({ x: 0, y: 0 })
  const pointerAnchor = React.useMemo(
    () => ({
      getBoundingClientRect: () =>
        DOMRect.fromRect({ x: pointerRef.current.x, y: pointerRef.current.y, width: 0, height: 0 }),
    }),
    [],
  )

  return (
    <HoverCard open={open} onOpenChange={setOpen}>
      <HoverCardTrigger
        delay={OPEN_DELAY_MS}
        closeDelay={CLOSE_DELAY_MS}
        render={trigger}
        onPointerMove={(event) => {
          if (!open) pointerRef.current = { x: event.clientX, y: event.clientY }
        }}
      >
        {children}
      </HoverCardTrigger>
      {/* Anchored at the pointer, not the full-width row, so the card opens
          next to where the user is looking. */}
      <HoverCardContent
        anchor={pointerAnchor}
        side="bottom"
        align="start"
        sideOffset={POINTER_OFFSET_PX}
        alignOffset={POINTER_OFFSET_PX}
        className="w-96 p-0 select-text"
      >
        <CommitCardBody hash={hash} />
      </HoverCardContent>
    </HoverCard>
  )
}

function CommitCardBody({ hash }: { hash: string }) {
  const { data: details, error } = useCommitDetails(hash)

  if (error) return <p className="p-3 text-caption text-danger">Couldn't load this commit.</p>
  if (!details || details.hash !== hash) {
    return <p className="p-3 text-caption text-ink-faint">Loading commit…</p>
  }

  return (
    <div className="flex flex-col divide-y divide-line-subtle">
      <AuthorLine details={details} />
      {details.co_authors.length > 0 && <CoAuthorsLine details={details} />}
      <MessageLine details={details} />
      <StatsLine stats={details.stats} />
      {details.branches.length > 0 && <BranchesLine branches={details.branches} />}
      <HashLine hash={details.hash} />
    </div>
  )
}

// 1 — photo, name, how long ago, exact date
function AuthorLine({ details }: { details: CommitDetails }) {
  const usersByEmail = useUsersByEmail()
  const { author } = details
  const photo = usersByEmail.get(author.email.toLowerCase())?.avatar_url
  const date = new Date(author.date)

  return (
    <div className="flex items-center gap-3 p-3">
      <Avatar size="lg" className="bg-canvas">
        {photo && <AvatarImage src={photo} alt="" />}
        <AvatarFallback className={"font-semibold " + authorColor(author.name)}>
          {authorInitials(author.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-title text-ink" title={author.email}>
          {author.name}
        </span>
        <span className="flex items-center gap-1.5 text-caption text-ink-faint">
          <Clock aria-hidden="true" className="size-icon-xs flex-none" />
          <span>{formatRelativeTime(date)}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={author.date}>{DATE_FORMAT.format(date)}</time>
        </span>
      </div>
    </div>
  )
}

// 2 — co-authors (e.g. an AI pair like Claude)
function CoAuthorsLine({ details }: { details: CommitDetails }) {
  return (
    <ul className="flex flex-col gap-1 px-3 py-2">
      {details.co_authors.map((coAuthor) => (
        <li key={coAuthor.email} className="flex items-center gap-icon text-caption" title={coAuthor.email}>
          <User aria-hidden="true" className="size-icon-sm flex-none text-ink-faint" />
          <span className="text-ink-faint">(Co-Author)</span>
          <span className="truncate text-ink">{coAuthor.name}</span>
        </li>
      ))}
    </ul>
  )
}

// 3 — the commit message
function MessageLine({ details }: { details: CommitDetails }) {
  return (
    <div className="flex max-h-48 flex-col gap-1 overflow-y-auto px-3 py-2">
      <p className="text-row font-semibold break-words text-ink">{details.subject}</p>
      {details.body && (
        <p className="text-caption break-words whitespace-pre-wrap text-ink-secondary">{details.body}</p>
      )}
    </div>
  )
}

function plural(count: number, singular: string, pluralForm: string) {
  return `${count} ${count === 1 ? singular : pluralForm}`
}

// 4 — "10 files changed, 3 insertions(+), 2 deletions(-)", one line
function StatsLine({ stats }: { stats: CommitStats }) {
  return (
    <p className="truncate px-3 py-2 text-caption text-ink-secondary">
      {plural(stats.files_changed, "file changed", "files changed")},{" "}
      <span className="text-success">{plural(stats.insertions, "insertion(+)", "insertions(+)")}</span>,{" "}
      <span className="text-danger">{plural(stats.deletions, "deletion(-)", "deletions(-)")}</span>
    </p>
  )
}

// Current branch first, then the other local ones, then remotes.
function branchRank(branch: CommitBranch) {
  return branch.current ? 0 : branch.remote ? 2 : 1
}

// 5 — branches containing the commit: target = current, branch = local,
// cloud = remote; icon at the span's left edge, name at its right.
function BranchesLine({ branches }: { branches: CommitBranch[] }) {
  const sorted = [...branches].sort((a, b) => branchRank(a) - branchRank(b) || a.name.localeCompare(b.name))

  return (
    <div className="flex flex-wrap gap-1.5 px-3 py-2">
      {sorted.map((branch) => {
        const Icon = branch.remote ? Cloud : branch.current ? Target : GitBranch
        const kind = branch.remote ? "Remote branch" : branch.current ? "Current branch" : "Local branch"
        return (
          <span
            key={`${branch.remote ? "remote" : "local"}:${branch.name}`}
            title={`${kind}: ${branch.name}`}
            className={
              "flex max-w-full min-w-0 items-center justify-between gap-2 rounded-sm border px-1.5 py-0.5 text-caption " +
              (branch.current ? "border-accent text-accent-text" : "border-line-default text-ink-secondary")
            }
          >
            <Icon aria-label={kind} className="size-icon-xs flex-none" />
            <span className="truncate font-mono">{branch.name}</span>
          </span>
        )
      })}
    </div>
  )
}

// 6 — the full hash, selectable and copyable
function HashLine({ hash }: { hash: string }) {
  const [copied, setCopied] = React.useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(hash)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error("Couldn't copy the hash")
    }
  }

  return (
    <div className="flex items-center gap-icon px-3 py-2">
      <GitCommitVertical aria-hidden="true" className="size-icon-sm flex-none text-ink-faint" />
      <span className="min-w-0 flex-1 truncate font-mono text-caption text-ink select-all">{hash}</span>
      <button
        type="button"
        onClick={() => void copy()}
        aria-label="Copy commit hash"
        title="Copy commit hash"
        className="flex size-control-sm flex-none items-center justify-center rounded-sm text-ink-faint outline-none hover:bg-overlay-hover hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {copied ? (
          <Check aria-hidden="true" className="size-icon-sm text-success" />
        ) : (
          <Copy aria-hidden="true" className="size-icon-sm" />
        )}
      </button>
    </div>
  )
}
