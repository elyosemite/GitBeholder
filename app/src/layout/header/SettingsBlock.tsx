import { Settings } from "lucide-react"

import { useTabActions, useTabs } from "@/features/tabs"

// Opens (or focuses) the Settings tab; highlighted while that tab is active.
export function SettingsBlock() {
  const { activeId } = useTabs()
  const { openSettings } = useTabActions()
  const active = activeId === "settings"

  return (
    <button
      type="button"
      aria-label="Settings"
      aria-pressed={active}
      title="Settings"
      onClick={openSettings}
      className={
        "flex size-control flex-none items-center justify-center rounded-md outline-none hover:bg-overlay-hover hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/50 " +
        (active ? "text-accent" : "text-ink-secondary")
      }
    >
      <Settings aria-hidden="true" className="size-icon-md" />
    </button>
  )
}
