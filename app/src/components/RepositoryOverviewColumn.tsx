import {
  Archive,
  CircleCheck,
  CircleDot,
  Cloud,
  GitBranch,
  GitPullRequest,
  GitPullRequestDraft,
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
  BRANCHES,
  CURRENT_BRANCH,
  INTEGRATIONS,
  ISSUES,
  PULL_REQUESTS,
  STASHES,
  TAGS,
  TEAMS,
} from "@/mocks/git-data"
import { ColumnHeader } from "./panel-primitives"

const LOCAL_BRANCHES = BRANCHES
const REMOTE_BRANCHES = BRANCHES.filter((branch) => branch.origin)

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
      <AccordionTrigger className="px-2 py-2 text-[10.5px] font-bold uppercase tracking-[0.08em] text-ink-faint hover:no-underline">
        <span className="flex items-center gap-2">
          {title}
          <Badge variant="outline" className="h-4 px-1.5 font-mono text-[10px] font-normal text-ink-faint">
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

function BranchRow({ name, remote }: { name: string; remote?: boolean }) {
  const current = !remote && name === CURRENT_BRANCH
  const Icon = remote ? Cloud : GitBranch

  return (
    <div className="flex items-center gap-2 rounded-md px-1 py-0.5 text-[12.5px] hover:bg-overlay-hover">
      <Icon
        aria-hidden="true"
        size={13}
        className={"flex-none " + (remote ? "text-sky-500" : current ? "text-accent" : "text-ink-faint")}
      />
      <span className={"truncate " + (current ? "font-semibold text-accent" : "text-ink-secondary")}>
        {remote ? `origin/${name}` : name}
      </span>
      {current && (
        <Badge variant="outline" className="ml-auto h-4 flex-none px-1.5 text-[9.5px] text-ink-faint">
          atual
        </Badge>
      )}
    </div>
  )
}

export function RepositoryOverviewColumn() {
  return (
    <div className="flex h-full flex-col overflow-y-auto border-r border-line-subtle bg-panel">
      <ColumnHeader title="Overview" />

      <div className="border-b border-line-subtle px-4 py-3">
        <div className="truncate text-[13px] font-medium text-ink">GitBeholder</div>
        <div className="truncate text-[11.5px] text-ink-faint" title="C:\Users\Alfredo\Projects\GitBeholder">
          C:\Users\Alfredo\Projects\GitBeholder
        </div>
      </div>

      <Accordion defaultValue={["local-branches"]}>
        <Section value="integrations" title="Integrações" count={INTEGRATIONS.length}>
          {INTEGRATIONS.map(({ name, connected }) => (
            <div key={name} className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-overlay-hover">
              <Avatar size="sm">
                <AvatarFallback className="text-[9px] font-semibold">{initials(name)}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink-secondary">{name}</span>
              {connected ? (
                <Badge variant="outline" className="h-4 flex-none px-1.5 text-[9.5px] text-success">
                  Conectado
                </Badge>
              ) : (
                <span className="flex-none text-[10px] text-ink-faint">Não conectado</span>
              )}
            </div>
          ))}
        </Section>

        <Section value="pull-requests" title="Pull Requests" count={PULL_REQUESTS.length}>
          {PULL_REQUESTS.map((pr) => {
            const StatusIcon = pr.status === "open" ? GitPullRequest : GitPullRequestDraft
            return (
              <div key={pr.number} className="flex items-start gap-2 rounded-md px-1 py-1 hover:bg-overlay-hover">
                <StatusIcon
                  aria-hidden="true"
                  size={14}
                  className={"mt-0.5 flex-none " + (pr.status === "open" ? "text-success" : "text-ink-faint")}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] text-ink">{pr.title}</div>
                  <div className="text-[10.5px] text-ink-faint">
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
              <div key={issue.number} className="flex items-start gap-2 rounded-md px-1 py-1 hover:bg-overlay-hover">
                <StateIcon
                  aria-hidden="true"
                  size={14}
                  className={"mt-0.5 flex-none " + (issue.state === "open" ? "text-success" : "text-brand-to")}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] text-ink">{issue.title}</div>
                  <div className="flex items-center gap-1.5 text-[10.5px] text-ink-faint">
                    #{issue.number}
                    <Badge variant="secondary" className="h-4 px-1.5 text-[9.5px] font-normal">
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
            <div key={team.name} className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-overlay-hover">
              <Avatar size="sm">
                <AvatarFallback className="text-[9px] font-semibold">{initials(team.name)}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink-secondary">{team.name}</span>
              <span className="flex-none text-[10px] text-ink-faint">{team.members} membros</span>
            </div>
          ))}
        </Section>

        <Section value="local-branches" title="Branches locais" count={LOCAL_BRANCHES.length}>
          {LOCAL_BRANCHES.map((branch) => (
            <BranchRow key={branch.name} name={branch.name} />
          ))}
        </Section>

        <Section value="remote-branches" title="Branches remotas" count={REMOTE_BRANCHES.length}>
          {REMOTE_BRANCHES.map((branch) => (
            <BranchRow key={branch.name} name={branch.name} remote />
          ))}
        </Section>

        <Section value="tags" title="Tags" count={TAGS.length}>
          {TAGS.map((tag) => (
            <div key={tag.name} className="flex items-center gap-2 rounded-md px-1 py-0.5 hover:bg-overlay-hover">
              <Tag aria-hidden="true" size={13} className="flex-none text-ink-faint" />
              <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-ink-secondary">{tag.name}</span>
              <span className="flex-none font-mono text-[10px] text-ink-faint">{tag.date}</span>
            </div>
          ))}
        </Section>

        <Section value="stashes" title="Stashes" count={STASHES.length}>
          {STASHES.map((stash) => (
            <div key={stash.index} className="flex items-start gap-2 rounded-md px-1 py-1 hover:bg-overlay-hover">
              <Archive aria-hidden="true" size={14} className="mt-0.5 flex-none text-ink-faint" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] text-ink">
                  <span className="font-mono text-[11px] text-ink-faint">stash@{"{"}{stash.index}{"}"}</span>{" "}
                  {stash.message}
                </div>
                <div className="truncate text-[10.5px] text-ink-faint">em {stash.branch}</div>
              </div>
            </div>
          ))}
        </Section>
      </Accordion>
    </div>
  )
}
