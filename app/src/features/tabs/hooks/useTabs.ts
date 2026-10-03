import { useSyncExternalStore } from "react";
import { getTabsState, subscribeTabs } from "../store";

export function useTabs() {
  return useSyncExternalStore(subscribeTabs, getTabsState);
}
