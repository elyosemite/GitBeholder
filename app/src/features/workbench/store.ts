/**
 * Which workbench areas are visible: the primary sidebar (overview
 * column), the secondary sidebar (changes column) and the bottom panel
 * (commit details). Persisted, so the layout survives a restart.
 */
export interface WorkbenchLayout {
  primarySidebar: boolean;
  secondarySidebar: boolean;
  panel: boolean;
}

export type WorkbenchArea = keyof WorkbenchLayout;

const STORAGE_KEY = "gitbeholder.workbench";
const DEFAULT_LAYOUT: WorkbenchLayout = { primarySidebar: true, secondarySidebar: true, panel: true };

const listeners = new Set<() => void>();
let layout: WorkbenchLayout = readStoredLayout();

// localStorage can be unavailable or throw; the default layout is fine then.
function readStoredLayout(): WorkbenchLayout {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (stored && typeof stored === "object") return { ...DEFAULT_LAYOUT, ...stored };
  } catch {
    // fall through
  }
  return DEFAULT_LAYOUT;
}

export function getWorkbenchLayout(): WorkbenchLayout {
  return layout;
}

export function subscribeWorkbenchLayout(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function toggleWorkbenchArea(area: WorkbenchArea) {
  layout = { ...layout, [area]: !layout[area] };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  } catch {
    // not persisted; still applied for this session
  }
  listeners.forEach((listener) => listener());
}
