import { useSyncExternalStore } from "react";
import { getWorkbenchLayout, subscribeWorkbenchLayout, toggleWorkbenchArea } from "../store";

export function useWorkbenchLayout() {
  const layout = useSyncExternalStore(subscribeWorkbenchLayout, getWorkbenchLayout);
  return { layout, toggle: toggleWorkbenchArea };
}
