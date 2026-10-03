import { useMemo, useRef } from "react";
import { useSessionActions, useSessionValue } from "@/features/session";
import { activateTab, closeTab, getTabsState, openSettingsTab } from "../store";
import type { Tab } from "../types";

/**
 * Tab actions that keep the session in step: a repository tab becoming
 * active selects its repository; closing the last repository tab leaves
 * no repository selected.
 */
export function useTabActions() {
  const { selectRepository, closeRepository } = useSessionActions();
  // Read inside the actions, not a dependency: actions stay stable.
  const currentRepository = useSessionValue((s) => s.repository);
  const currentRepositoryRef = useRef(currentRepository);
  currentRepositoryRef.current = currentRepository;

  return useMemo(() => {
    // Re-selecting the repository already open (e.g. back from Settings)
    // would refetch everything and drop the selected commit — skip it.
    const focusRepositoryOf = (tab: Tab | null) => {
      if (tab?.kind !== "repository") return;
      if (currentRepositoryRef.current?.id === tab.repository.id) return;
      selectRepository(tab.repository);
    };

    return {
      activate(tab: Tab) {
        if (getTabsState().activeId === tab.id) return;
        activateTab(tab.id);
        focusRepositoryOf(tab);
      },
      close(tab: Tab) {
        const next = closeTab(tab.id);
        if (!getTabsState().tabs.some((t) => t.kind === "repository")) {
          closeRepository();
          return;
        }
        focusRepositoryOf(next);
      },
      openSettings: openSettingsTab,
    };
  }, [selectRepository, closeRepository]);
}
