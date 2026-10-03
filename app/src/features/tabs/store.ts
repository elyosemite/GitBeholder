import type { Repository } from "@/features/repositories";
import type { Tab, TabsState } from "./types";

const SETTINGS_TAB: Tab = { id: "settings", kind: "settings" };

let state: TabsState = { tabs: [], activeId: null };
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

/** Focuses the repository's tab, opening it at the end if needed. */
export function openRepositoryTab(repository: Repository) {
  const id = repositoryTabId(repository.id);
  const exists = state.tabs.some((tab) => tab.id === id);
  if (exists && state.activeId === id) return;

  setState({
    tabs: exists ? state.tabs : [...state.tabs, { id, kind: "repository", repository }],
    activeId: id,
  });
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
 * the left one when it was last). Returns the tab that is active afterwards.
 */
export function closeTab(id: string): Tab | null {
  const index = state.tabs.findIndex((tab) => tab.id === id);
  if (index === -1) return activeTab();

  const tabs = state.tabs.filter((tab) => tab.id !== id);
  const activeId =
    state.activeId === id ? (tabs[Math.min(index, tabs.length - 1)]?.id ?? null) : state.activeId;

  setState({ tabs, activeId });
  return activeTab();
}

export function activeTab(): Tab | null {
  return state.tabs.find((tab) => tab.id === state.activeId) ?? null;
}
