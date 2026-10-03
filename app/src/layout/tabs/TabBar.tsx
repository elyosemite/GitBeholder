import { FolderGit2, Settings, X } from "lucide-react"

import { useRepositoryTabSync, useTabActions, useTabs, type Tab } from "@/features/tabs"

function tabLabel(tab: Tab) {
  return tab.kind === "repository" ? tab.repository.name : "Settings"
}

function TabIcon({ tab }: { tab: Tab }) {
  const Icon = tab.kind === "repository" ? FolderGit2 : Settings
  return <Icon aria-hidden="true" className="size-icon-sm flex-none" />
}

// Top-level navigation: one tab per open repository plus Settings; future
// integrations add boards and issues as new tab kinds.
export function TabBar() {
  useRepositoryTabSync()
  const { tabs, activeId } = useTabs()
  const { activate, close } = useTabActions()

  return (
    <div className="flex h-control-lg flex-none items-stretch border-b border-line-subtle bg-panel">
      <div role="tablist" aria-label="Open tabs" className="flex min-w-0 flex-1 items-stretch overflow-x-auto">
        {tabs.map((tab) => {
          const active = tab.id === activeId
          const label = tabLabel(tab)

          return (
            <div
              key={tab.id}
              className={
                "group relative flex max-w-56 min-w-0 flex-none items-center border-r border-line-subtle " +
                (active ? "bg-canvas text-ink" : "text-ink-secondary hover:bg-overlay-hover hover:text-ink")
              }
            >
              {/* Active indicator: the brand rail along the top edge. */}
              {active && <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-accent" />}
              <button
                type="button"
                role="tab"
                aria-selected={active}
                title={tab.kind === "repository" ? tab.repository.path : label}
                onClick={() => activate(tab)}
                onAuxClick={(event) => {
                  if (event.button === 1) close(tab)
                }}
                className="flex h-full min-w-0 items-center gap-icon pr-1 pl-row-x text-row font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
              >
                <TabIcon tab={tab} />
                <span className="truncate">{label}</span>
              </button>
              <button
                type="button"
                aria-label={`Close ${label}`}
                onClick={() => close(tab)}
                className={
                  "mr-1 flex size-control-sm flex-none items-center justify-center rounded-sm text-ink-faint outline-none hover:bg-overlay-press hover:text-ink focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50 " +
                  (active ? "opacity-100" : "opacity-0 group-hover:opacity-100")
                }
              >
                <X aria-hidden="true" className="size-icon-xs" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
