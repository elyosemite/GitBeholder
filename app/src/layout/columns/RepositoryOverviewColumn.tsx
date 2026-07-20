import { useState } from "react"
import {
  Archive,
  CircleCheck,
  CircleDot,
  Cloud,
  FileText,
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
import { PlatformIcon } from "@/components/icons/brand-icons"
import {
  INTEGRATIONS,
  ISSUES,
  PULL_REQUESTS,
  TEAMS,
} from "@/mocks/git-data"
import { useBranches, useCheckoutBranch, type Branch } from "@/features/branches"
import { useStashes } from "@/features/stashes"
import { useTags } from "@/features/tags"
import { useCommitFiles, type CommitFileChange } from "@/features/commits"
import { useAzureDevOpsIntegration, useDisconnectAzureDevOps } from "@/features/integrations"
import { useSession } from "@/features/session"
import { splitPath } from "@/lib/paths"
import { ConnectAzureDevOpsDialog } from "./ConnectAzureDevOpsDialog"

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

// Stagger the entrance so each list reads top-to-bottom instead of popping
// in all at once; caps out so a long list doesn't feel sluggish.
function staggerStyle(index: number) {
  return { animationDelay: `${Math.min(index, 8) * 40}ms`, animationFillMode: "backwards" as const }
}

const ROW_ANIMATION = "animate-in fade-in-0 slide-in-from-top-1"

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
  index,
  isCheckingOut,
  disabled,
  onCheckout,
}: {
  branch: Branch
  index: number
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
      style={staggerStyle(index)}
      className={`flex w-full items-center gap-icon px-1 py-1 text-row hover:bg-overlay-hover disabled:pointer-events-none disabled:opacity-60 ${ROW_ANIMATION}`}
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
          current
        </Badge>
      )}
    </button>
  )
}

function InspectFileRow({
  file,
  index,
  onOpenDiff,
}: {
  file: CommitFileChange
  index: number
  onOpenDiff: () => void
}) {
  const { name, dir } = splitPath(file.path)

  return (
    <button
      type="button"
      onClick={onOpenDiff}
      className={`flex w-full items-center gap-icon px-1 py-1 text-row text-left hover:bg-overlay-hover ${ROW_ANIMATION}`}
      style={staggerStyle(index)}
    >
      <FileText aria-hidden="true" size={13} className="flex-none text-ink-faint" />
      <span className="flex min-w-0 flex-1 items-baseline gap-icon" title={file.path}>
        <span className="flex-none text-ink">{name}</span>
        {dir && <span className="min-w-0 flex-1 truncate text-ink-faint">{dir}</span>}
      </span>
      <span className="flex flex-none items-center gap-1.5 font-mono text-meta">
        {file.additions !== null && <span className="text-success">+{file.additions}</span>}
        {file.deletions !== null && <span className="text-danger">-{file.deletions}</span>}
      </span>
    </button>
  )
}

export function RepositoryOverviewColumn() {
  const { data: branches } = useBranches()
  const allBranches = branches ?? []

  const checkoutBranch = useCheckoutBranch()
  const [checkingOutName, setCheckingOutName] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const { data: azureDevOpsIntegration } = useAzureDevOpsIntegration()
  const disconnectAzureDevOps = useDisconnectAzureDevOps()
  const [isAzureDialogOpen, setIsAzureDialogOpen] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [integrationError, setIntegrationError] = useState<string | null>(null)
  const otherIntegrations = INTEGRATIONS.filter(({ name }) => name !== "Azure DevOps")

  const handleDisconnectAzureDevOps = async () => {
    setIsDisconnecting(true)
    setIntegrationError(null)
    try {
      await disconnectAzureDevOps()
    } catch (err) {
      setIntegrationError(String(err))
    } finally {
      setIsDisconnecting(false)
    }
  }

  const { data: stashes } = useStashes()
  const stashList = stashes ?? []

  const { data: tags } = useTags()
  const tagList = tags ?? []

  const { inspectedCommit, openDiff } = useSession()
  const { data: commitFiles } = useCommitFiles()
  const commitFileList = commitFiles ?? []

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

      <Accordion defaultValue={["branches"]}>
        <Section value="integrations" title="Integrations" count={INTEGRATIONS.length}>
          <div
            style={staggerStyle(0)}
            className={`flex items-center gap-icon px-1 py-1 hover:bg-overlay-hover ${ROW_ANIMATION}`}
          >
            <PlatformIcon platform="azure-devops" size={14} className="flex-none text-ink-secondary" />
            <span className="min-w-0 flex-1 truncate text-row text-ink-secondary">Azure DevOps</span>
            {azureDevOpsIntegration ? (
              <>
                <Badge variant="outline" className="h-4 flex-none px-1.5 text-micro text-success">
                  Connected
                </Badge>
                <button
                  type="button"
                  disabled={isDisconnecting}
                  onClick={() => void handleDisconnectAzureDevOps()}
                  className="flex-none text-meta text-ink-faint hover:text-danger disabled:pointer-events-none disabled:opacity-60"
                >
                  {isDisconnecting ? "Disconnecting…" : "Disconnect"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsAzureDialogOpen(true)}
                className="flex-none text-meta text-ink-faint hover:text-ink-secondary"
              >
                Connect…
              </button>
            )}
          </div>

          {otherIntegrations.map(({ name, connected }, index) => (
            <div
              key={name}
              style={staggerStyle(index + 1)}
              className={`flex items-center gap-icon px-1 py-1 hover:bg-overlay-hover ${ROW_ANIMATION}`}
            >
              <Avatar size="sm">
                <AvatarFallback className="text-micro font-semibold">{initials(name)}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 truncate text-row text-ink-secondary">{name}</span>
              {connected ? (
                <Badge variant="outline" className="h-4 flex-none px-1.5 text-micro text-success">
                  Connected
                </Badge>
              ) : (
                <span className="flex-none text-meta text-ink-faint">Not connected</span>
              )}
            </div>
          ))}
        </Section>

        <Section value="pull-requests" title="Pull Requests" count={PULL_REQUESTS.length}>
          {PULL_REQUESTS.map((pr, index) => {
            const StatusIcon = pr.status === "open" ? GitPullRequest : GitPullRequestDraft
            return (
              <div
                key={pr.number}
                style={staggerStyle(index)}
                className={`flex items-start gap-icon px-1 py-1 hover:bg-overlay-hover ${ROW_ANIMATION}`}
              >
                <StatusIcon
                  aria-hidden="true"
                  size={14}
                  className={"mt-0.5 flex-none " + (pr.status === "open" ? "text-success" : "text-ink-faint")}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-row text-ink">{pr.title}</div>
                  <div className="text-meta text-ink-faint">
                    #{pr.number} by {pr.author}
                  </div>
                </div>
              </div>
            )
          })}
        </Section>

        <Section value="issues" title="Issues" count={ISSUES.length}>
          {ISSUES.map((issue, index) => {
            const StateIcon = issue.state === "open" ? CircleDot : CircleCheck
            return (
              <div
                key={issue.number}
                style={staggerStyle(index)}
                className={`flex items-start gap-icon px-1 py-1 hover:bg-overlay-hover ${ROW_ANIMATION}`}
              >
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
          {TEAMS.map((team, index) => (
            <div
              key={team.name}
              style={staggerStyle(index)}
              className={`flex items-center gap-icon px-1 py-1 hover:bg-overlay-hover ${ROW_ANIMATION}`}
            >
              <Avatar size="sm">
                <AvatarFallback className="text-micro font-semibold">{initials(team.name)}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 truncate text-row text-ink-secondary">{team.name}</span>
              <span className="flex-none text-meta text-ink-faint">{team.members} members</span>
            </div>
          ))}
        </Section>

        <Section value="branches" title="Branches" count={allBranches.length}>
          {allBranches.map((branch, index) => (
            <BranchRow
              key={branch.name}
              branch={branch}
              index={index}
              isCheckingOut={checkingOutName === branch.name}
              disabled={checkingOutName !== null}
              onCheckout={() => void handleCheckout(branch)}
            />
          ))}
        </Section>

        <Section value="tags" title="Tags" count={tagList.length}>
          {tagList.map((tag, index) => (
            <button
              key={tag.name}
              type="button"
              style={staggerStyle(index)}
              className={`flex w-full items-center gap-icon px-1 py-1 text-left hover:bg-overlay-hover ${ROW_ANIMATION}`}
            >
              <Tag aria-hidden="true" size={13} className="flex-none text-ink-faint" />
              <span className="min-w-0 flex-1 truncate font-mono text-row text-ink-secondary">{tag.name}</span>
              <span className="flex-none font-mono text-meta text-ink-faint">{tag.date}</span>
            </button>
          ))}
        </Section>

        <Section value="stashes" title="Stashes" count={stashList.length}>
          {stashList.map((stash, index) => (
            <div
              key={stash.index}
              style={staggerStyle(index)}
              className={`flex items-start gap-icon px-1 py-1 hover:bg-overlay-hover ${ROW_ANIMATION}`}
            >
              <Archive aria-hidden="true" size={14} className="mt-0.5 flex-none text-ink-faint" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-row text-ink">
                  <span className="font-mono text-caption text-ink-faint">stash@{"{"}{stash.index}{"}"}</span>{" "}
                  {stash.message}
                </div>
                <div className="truncate text-meta text-ink-faint">on {stash.branch}</div>
              </div>
            </div>
          ))}
        </Section>

        <Section value="inspect" title="Inspect" count={commitFileList.length}>
          {inspectedCommit === null ? (
            <div className="text-caption text-ink-faint">
              Click a commit to see its changed files.
            </div>
          ) : commitFileList.length > 0 ? (
            commitFileList.map((file, index) => (
              <InspectFileRow
                key={file.path}
                file={file}
                index={index}
                onOpenDiff={() => openDiff(file.path)}
              />
            ))
          ) : (
            <div className="text-caption text-ink-faint">No files changed.</div>
          )}
        </Section>
      </Accordion>

      {checkoutError && (
        <div className="border-t border-line-subtle px-panel-x py-2 text-caption text-danger">
          {checkoutError}
        </div>
      )}

      {integrationError && (
        <div className="border-t border-line-subtle px-panel-x py-2 text-caption text-danger">
          {integrationError}
        </div>
      )}

      <ConnectAzureDevOpsDialog open={isAzureDialogOpen} onOpenChange={setIsAzureDialogOpen} />
    </div>
  )
}
