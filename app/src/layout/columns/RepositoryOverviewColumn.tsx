import { useState } from "react"
import {
  Archive,
  CircleCheck,
  CircleDot,
  Cloud,
  GitBranch,
  GitPullRequest,
  GitPullRequestDraft,
  Loader2,
  Tag,
} from "lucide-react"
import type { ReactNode } from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  INTEGRATIONS,
  ISSUES,
  PULL_REQUESTS,
  TAGS,
  TEAMS,
} from "@/mocks/git-data"
import { useBranches, useCheckoutBranch, type Branch } from "@/features/branches"
import { useStashes } from "@/features/stashes"

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function Section({
  value,
  title,
  count,
  children,
}: {
  value: string
  title: string
  count: number
  children: ReactNode
}) {
  return (
    <AccordionItem value={value} className="border-line-subtle px-2">
      <AccordionTrigger className="px-2 py-2 text-meta font-bold uppercase tracking-[0.08em] text-ink-faint hover:no-underline">
        <span className="flex items-center gap-2">
          {title}
          <Badge variant="outline" className="h-4 px-1.5 font-mono text-micro font-normal text-ink-faint">
            {count}
          </Badge>
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-2">
        <div className="flex max-h-56 flex-col gap-1 overflow-y-auto pr-1">{children}</div>
      </AccordionContent>
    </AccordionItem>
  )
}

function BranchRow({
  branch,
  isCheckingOut,
  disabled,
  onCheckout,
}: {
  branch: Branch
  isCheckingOut: boolean
  disabled: boolean
  onCheckout: () => void
}) {
  const Icon = branch.local ? GitBranch : Cloud

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onCheckout}
      className="flex w-full items-center gap-icon rounded-md px-1 py-1 text-row hover:bg-overlay-hover disabled:pointer-events-none disabled:opacity-60"
    >
      {isCheckingOut ? (
        <Loader2 aria-hidden="true" size={13} className="flex-none animate-spin text-accent" />
      ) : (
        <Icon
          aria-hidden="true"
          size={13}
          className={"flex-none " + (!branch.local ? "text-sky-500" : branch.current ? "text-accent" : "text-ink-faint")}
        />
      )}
      <span className={"truncate " + (branch.current ? "font-semibold text-accent" : "text-ink-secondary")}>
        {branch.local ? branch.name : `${branch.remote}/${branch.name}`}
      </span>
      {branch.current && (
        <Badge variant="outline" className="ml-auto h-4 flex-none px-1.5 text-micro text-ink-faint">
          atual
        </Badge>
      )}
    </button>
  )
}

export function RepositoryOverviewColumn() {
  const { data: branches } = useBranches()
  const allBranches = branches ?? []
  const localBranches = allBranches.filter((branch) => branch.local)
  const remoteBranches = allBranches.filter((branch) => branch.remote !== null)

  const checkoutBranch = useCheckoutBranch()
  const [checkingOutName, setCheckingOutName] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const { data: stashes } = useStashes()
  const stashList = stashes ?? []

  const handleCheckout = async (branch: Branch) => {
    setCheckingOutName(branch.name)
    setCheckoutError(null)
    try {
      await checkoutBranch(branch.name)
    } catch (err) {
      setCheckoutError(String(err))
    } finally {
      setCheckingOutName(null)
    }
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto border-r border-line-subtle bg-panel">
      {/* <ColumnHeader title="Overview" /> */}

      <div className="border-b border-line-subtle px-panel-x py-panel-y">
        <div className="truncate text-body font-medium text-ink">GitBeholder</div>
        <div className="truncate text-caption text-ink-faint" title="C:\Users\Alfredo\Projects\GitBeholder">
          C:\Users\Alfredo\Projects\GitBeholder
        </div>
      </div>

      <Accordion defaultValue={["local-branches"]}>
        <Section value="integrations" title="Integrações" count={INTEGRATIONS.length}>
          {INTEGRATIONS.map(({ name, connected }) => (
            <div key={name} className="flex items-center gap-icon rounded-md px-1 py-1 hover:bg-overlay-hover">
              <Avatar size="sm">
                <AvatarFallback className="text-micro font-semibold">{initials(name)}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 truncate text-row text-ink-secondary">{name}</span>
              {connected ? (
                <Badge variant="outline" className="h-4 flex-none px-1.5 text-micro text-success">
                  Conectado
                </Badge>
              ) : (
                <span className="flex-none text-meta text-ink-faint">Não conectado</span>
              )}
            </div>
          ))}
        </Section>

        <Section value="pull-requests" title="Pull Requests" count={PULL_REQUESTS.length}>
          {PULL_REQUESTS.map((pr) => {
            const StatusIcon = pr.status === "open" ? GitPullRequest : GitPullRequestDraft
            return (
              <div key={pr.number} className="flex items-start gap-icon rounded-md px-1 py-1 hover:bg-overlay-hover">
                <StatusIcon
                  aria-hidden="true"
                  size={14}
                  className={"mt-0.5 flex-none " + (pr.status === "open" ? "text-success" : "text-ink-faint")}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-row text-ink">{pr.title}</div>
                  <div className="text-meta text-ink-faint">
                    #{pr.number} por {pr.author}
                  </div>
                </div>
              </div>
            )
          })}
        </Section>

        <Section value="issues" title="Issues" count={ISSUES.length}>
          {ISSUES.map((issue) => {
            const StateIcon = issue.state === "open" ? CircleDot : CircleCheck
            return (
              <div key={issue.number} className="flex items-start gap-icon rounded-md px-1 py-1 hover:bg-overlay-hover">
                <StateIcon
                  aria-hidden="true"
                  size={14}
                  className={"mt-0.5 flex-none " + (issue.state === "open" ? "text-success" : "text-brand-to")}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-row text-ink">{issue.title}</div>
                  <div className="flex items-center gap-1.5 text-meta text-ink-faint">
                    #{issue.number}
                    <Badge variant="secondary" className="h-4 px-1.5 text-micro font-normal">
                      {issue.label}
                    </Badge>
                  </div>
                </div>
              </div>
            )
          })}
        </Section>

        <Section value="teams" title="Teams" count={TEAMS.length}>
          {TEAMS.map((team) => (
            <div key={team.name} className="flex items-center gap-icon rounded-md px-1 py-1 hover:bg-overlay-hover">
              <Avatar size="sm">
                <AvatarFallback className="text-micro font-semibold">{initials(team.name)}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 truncate text-row text-ink-secondary">{team.name}</span>
              <span className="flex-none text-meta text-ink-faint">{team.members} membros</span>
            </div>
          ))}
        </Section>

        <Section value="local-branches" title="Branches locais" count={localBranches.length}>
          {localBranches.map((branch) => (
            <BranchRow
              key={branch.name}
              branch={branch}
              isCheckingOut={checkingOutName === branch.name}
              disabled={checkingOutName !== null}
              onCheckout={() => void handleCheckout(branch)}
            />
          ))}
        </Section>

        <Section value="remote-branches" title="Branches remotas" count={remoteBranches.length}>
          {remoteBranches.map((branch) => (
            <BranchRow
              key={branch.name}
              branch={branch}
              isCheckingOut={checkingOutName === branch.name}
              disabled={checkingOutName !== null}
              onCheckout={() => void handleCheckout(branch)}
            />
          ))}
        </Section>

        <Section value="tags" title="Tags" count={TAGS.length}>
          {TAGS.map((tag) => (
            <div key={tag.name} className="flex items-center gap-icon rounded-md px-1 py-1 hover:bg-overlay-hover">
              <Tag aria-hidden="true" size={13} className="flex-none text-ink-faint" />
              <span className="min-w-0 flex-1 truncate font-mono text-row text-ink-secondary">{tag.name}</span>
              <span className="flex-none font-mono text-meta text-ink-faint">{tag.date}</span>
            </div>
          ))}
        </Section>

        <Section value="stashes" title="Stashes" count={stashList.length}>
          {stashList.map((stash) => (
            <div key={stash.index} className="flex items-start gap-icon rounded-md px-1 py-1 hover:bg-overlay-hover">
              <Archive aria-hidden="true" size={14} className="mt-0.5 flex-none text-ink-faint" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-row text-ink">
                  <span className="font-mono text-caption text-ink-faint">stash@{"{"}{stash.index}{"}"}</span>{" "}
                  {stash.message}
                </div>
                <div className="truncate text-meta text-ink-faint">em {stash.branch}</div>
              </div>
            </div>
          ))}
        </Section>
      </Accordion>

      {checkoutError && (
        <div className="border-t border-line-subtle px-panel-x py-2 text-caption text-danger">
          {checkoutError}
        </div>
      )}
    </div>
  )
}
