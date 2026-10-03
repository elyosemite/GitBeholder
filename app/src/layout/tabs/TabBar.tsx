import { FolderGit2, LayoutGrid, PanelBottom, PanelLeft, PanelRight, Plus, Settings, X } from "lucide-react"

import { useRepositoryTabSync, useTabActions, useTabs, type Tab } from "@/features/tabs"
import { useWorkbenchLayout, type WorkbenchArea } from "@/features/workbench"

function tabLabel(tab: Tab) {
  switch (tab.kind) {
    case "repository":
      return tab.repository.name
    case "new":
      return "New tab"
    case "settings":
      return "Settings"
  }
}

const TAB_ICONS = { repository: FolderGit2, new: LayoutGrid, settings: Settings } as const

function TabIcon({ tab }: { tab: Tab }) {
  const Icon = TAB_ICONS[tab.kind]
  return <Icon aria-hidden="true" className="size-icon-sm flex-none" />
}

const LAYOUT_TOGGLES: { area: WorkbenchArea; label: string; shortcut: string; icon: typeof PanelLeft }[] = [
  { area: "primarySidebar", label: "Toggle Primary Side Bar", shortcut: "Ctrl+B", icon: PanelLeft },
  { area: "panel", label: "Toggle Panel", shortcut: "Ctrl+J", icon: PanelBottom },
  { area: "secondarySidebar", label: "Toggle Secondary Side Bar", shortcut: "Ctrl+Alt+B", icon: PanelRight },
]

// VS Code-style layout controls at the far right of the tab bar; each one
// also has a keyboard shortcut (features/workbench).
function LayoutToggles() {
  const { layout, toggle } = useWorkbenchLayout()

  return (
    <div className="ml-auto flex flex-none items-center gap-0.5 px-1">
      {LAYOUT_TOGGLES.map(({ area, label, shortcut, icon: Icon }) => (
        <button
          key={area}
          type="button"
          aria-label={label}
          aria-pressed={layout[area]}
          title={`${label} (${shortcut})`}
          onClick={() => toggle(area)}
          className={
            "flex size-control flex-none items-center justify-center rounded-md outline-none hover:bg-overlay-hover hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/50 " +
            (layout[area] ? "text-ink" : "text-ink-faint")
          }
        >
          <Icon aria-hidden="true" className="size-icon-md" />
        </button>
      ))}
    </div>
  )
}

// Top-level navigation: one tab per open repository plus Settings; future
// integrations add boards and issues as new tab kinds.
export function TabBar() {
  useRepositoryTabSync()
  const { tabs, activeId } = useTabs()
  const { activate, close, openNew } = useTabActions()

  return (
    <div className="flex h-control-lg flex-none items-stretch border-b border-line-subtle bg-panel">
      <div role="tablist" aria-label="Open tabs" className="flex min-w-0 items-stretch overflow-x-auto">
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

      {/* Right after the last tab, like a browser: always room for a new one. */}
      <button
        type="button"
        aria-label="New tab"
        title="New tab"
        onClick={openNew}
        className="flex w-control-lg flex-none items-center justify-center text-ink-secondary outline-none hover:bg-overlay-hover hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
      >
        <Plus aria-hidden="true" className="size-icon-md" />
      </button>

      <LayoutToggles />
    </div>
  )
}
