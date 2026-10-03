import type { Repository } from "@/features/repositories";
import type { Tab, TabsState } from "./types";

const SETTINGS_TAB: Tab = { id: "settings", kind: "settings" };

let newTabCounter = 0;
function newTab(): Tab {
  newTabCounter += 1;
  return { id: `new:${newTabCounter}`, kind: "new" };
}

// The app always has at least one tab; it starts on the launcher.
const firstTab = newTab();
let state: TabsState = { tabs: [firstTab], activeId: firstTab.id };
const listeners = new Set<() => void>();

function setState(next: TabsState) {
  state = next;
  listeners.forEach((listener) => listener());
}

export function getTabsState(): TabsState {
  return state;
}

export function subscribeTabs(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function repositoryTabId(repositoryId: number) {
  return `repository:${repositoryId}`;
}

export function activeTab(): Tab | null {
  return state.tabs.find((tab) => tab.id === state.activeId) ?? null;
}

/**
 * Focuses the repository's tab. If it isn't open yet it replaces the
 * active launcher in place (like picking a site in a browser's new tab),
 * or opens at the end otherwise.
 */
export function openRepositoryTab(repository: Repository) {
  const id = repositoryTabId(repository.id);
  if (state.tabs.some((tab) => tab.id === id)) {
    if (state.activeId !== id) setState({ ...state, activeId: id });
    return;
  }

  const repositoryTab: Tab = { id, kind: "repository", repository };
  const current = activeTab();
  const tabs =
    current?.kind === "new"
      ? state.tabs.map((tab) => (tab.id === current.id ? repositoryTab : tab))
      : [...state.tabs, repositoryTab];

  setState({ tabs, activeId: id });
}

/** Opens a launcher tab at the end (the + button). */
export function openNewTab() {
  const tab = newTab();
  setState({ tabs: [...state.tabs, tab], activeId: tab.id });
}

export function openSettingsTab() {
  const exists = state.tabs.some((tab) => tab.id === SETTINGS_TAB.id);
  setState({
    tabs: exists ? state.tabs : [...state.tabs, SETTINGS_TAB],
    activeId: SETTINGS_TAB.id,
  });
}

export function activateTab(id: string) {
  if (state.activeId !== id) setState({ ...state, activeId: id });
}

/**
 * Closes a tab. Closing the active one activates its right neighbour (or
 * the left one when it was last); closing the only tab leaves a launcher.
 * Returns the tab that is active afterwards.
 */
export function closeTab(id: string): Tab | null {
  const index = state.tabs.findIndex((tab) => tab.id === id);
  if (index === -1) return activeTab();

  let tabs = state.tabs.filter((tab) => tab.id !== id);
  if (tabs.length === 0) tabs = [newTab()];

  const activeId =
    state.activeId === id ? tabs[Math.min(index, tabs.length - 1)].id : state.activeId;

  setState({ tabs, activeId });
  return activeTab();
}
