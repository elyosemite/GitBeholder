import { Monitor, Moon, Sun } from "lucide-react"

import { useThemePreference, type ThemePreference } from "@/features/settings"

const THEME_OPTIONS: { value: ThemePreference; label: string; hint: string; icon: typeof Sun }[] = [
  { value: "system", label: "System", hint: "Follows Windows", icon: Monitor },
  { value: "light", label: "Light", hint: "Always light", icon: Sun },
  { value: "dark", label: "Dark", hint: "Always dark", icon: Moon },
]

export function SettingsView() {
  const [theme, setTheme] = useThemePreference()

  return (
    <div className="h-full overflow-y-auto bg-canvas">
      <div className="mx-auto flex max-w-2xl flex-col gap-8 px-panel-x py-8">
        <h1 className="text-display text-ink">Settings</h1>

        <section aria-labelledby="settings-appearance" className="flex flex-col gap-3">
          <div>
            <h2 id="settings-appearance" className="text-heading text-ink">
              Appearance
            </h2>
            <p className="text-caption text-ink-faint">Choose how GitBeholder looks.</p>
          </div>

          <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-3">
            {THEME_OPTIONS.map(({ value, label, hint, icon: Icon }) => {
              const selected = theme === value
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setTheme(value)}
                  className={
                    "flex flex-col items-start gap-2 rounded-lg border p-3 text-left outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 " +
                    (selected
                      ? "border-accent bg-accent-soft"
                      : "border-line-default bg-panel hover:bg-surface-hover")
                  }
                >
                  <Icon
                    aria-hidden="true"
                    className={"size-icon-md " + (selected ? "text-accent" : "text-ink-secondary")}
                  />
                  <span className="flex flex-col">
                    <span className="text-row font-medium text-ink">{label}</span>
                    <span className="text-caption text-ink-faint">{hint}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
