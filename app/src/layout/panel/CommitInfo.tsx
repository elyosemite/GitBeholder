import type { ReactNode } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { CommitDetails, CommitPerson } from "@/features/commits"
import { useSessionActions } from "@/features/session"
import { useUsersByEmail } from "@/features/users"
import { authorColor, authorInitials } from "@/lib/authorColor"
import { formatRelativeTime } from "@/lib/formatRelativeTime"

const DATE_FORMAT = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" })

function formatDate(iso: string) {
  const date = new Date(iso)
  return `${DATE_FORMAT.format(date)} (${formatRelativeTime(date)})`
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 flex-none text-caption text-ink-faint">{label}</dt>
      <dd className="min-w-0 flex-1 text-caption text-ink-secondary">{children}</dd>
    </div>
  )
}

function Person({ person }: { person: CommitPerson }) {
  return (
    <span className="break-words">
      <span className="text-ink">{person.name}</span> &lt;{person.email}&gt;
    </span>
  )
}

// Top block of the panel's first column: who made the commit, when, its
// parents and the full message.
export function CommitInfo({ details }: { details: CommitDetails }) {
  const { selectCommit } = useSessionActions()
  const usersByEmail = useUsersByEmail()
  const { author, committer } = details

  // The GitBeholder user with the author's email: photo and team.
  const user = usersByEmail.get(author.email.toLowerCase())
  const photo = user?.avatar_url ?? null

  return (
    <div className="flex flex-col gap-3 p-panel-x">
      <div className="flex items-center gap-3">
        <Avatar size="lg">
          {photo && <AvatarImage src={photo} alt="" />}
          <AvatarFallback className={"font-semibold " + authorColor(author.name)}>
            {authorInitials(author.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="truncate text-title text-ink">{author.name}</div>
          <div className="truncate text-caption text-ink-faint">
            {author.email}
            {user && <> · Team {user.team.name}</>}
          </div>
        </div>
      </div>

      <dl className="flex flex-col gap-1">
        <Field label="Commit">
          <span className="font-mono text-ink select-all">{details.hash}</span>
        </Field>
        <Field label={details.parents.length > 1 ? "Parents" : "Parent"}>
          {details.parents.length === 0 ? (
            <span className="text-ink-faint">None (root commit)</span>
          ) : (
            <span className="flex flex-wrap gap-x-2">
              {details.parents.map((parent) => (
                <button
                  key={parent}
                  type="button"
                  onClick={() => selectCommit(parent)}
                  title={`Show ${parent}`}
                  className="rounded-xs font-mono text-accent-text outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {parent.slice(0, 7)}
                </button>
              ))}
            </span>
          )}
        </Field>
        <Field label="Author">
          <Person person={author} />
        </Field>
        <Field label="Date">{formatDate(author.date)}</Field>
        <Field label="Committer">
          <Person person={committer} />
        </Field>
        <Field label="Commit date">{formatDate(committer.date)}</Field>
      </dl>

      <div className="flex flex-col gap-1">
        <p className="text-row font-semibold break-words text-ink">{details.subject}</p>
        {details.body && (
          <p className="text-caption break-words whitespace-pre-wrap text-ink-secondary">{details.body}</p>
        )}
      </div>
    </div>
  )
}
