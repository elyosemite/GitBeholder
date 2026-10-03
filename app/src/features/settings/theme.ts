export type ThemePreference = "system" | "light" | "dark";

const STORAGE_KEY = "gitbeholder.theme";
const LIGHT_QUERY = "(prefers-color-scheme: light)";

const listeners = new Set<() => void>();
let preference: ThemePreference = readStoredPreference();

// localStorage can be unavailable or throw (private mode, cleared site
// data); the theme then just falls back to following the system.
function readStoredPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {
    // fall through
  }
  return "system";
}

/**
 * Sets `data-theme` on <html> to the theme actually shown. App.css keys the
 * light palette on `:root[data-theme="light"]`; dark is the default.
 */
function apply() {
  const resolved =
    preference === "system" ? (matchMedia(LIGHT_QUERY).matches ? "light" : "dark") : preference;
  document.documentElement.dataset.theme = resolved;
}

export function getThemePreference(): ThemePreference {
  return preference;
}

export function setThemePreference(next: ThemePreference) {
  preference = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // not persisted; still applied for this session
  }
  apply();
  listeners.forEach((listener) => listener());
}

export function subscribeThemePreference(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Applies the stored theme before the first render and follows OS changes while on "system". */
export function initTheme() {
  apply();
  matchMedia(LIGHT_QUERY).addEventListener("change", () => {
    if (preference === "system") apply();
  });
}
