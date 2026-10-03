import { useEffect } from "react";
import { toggleWorkbenchArea, type WorkbenchArea } from "../store";

/**
 * VS Code's layout shortcuts: Ctrl+B primary sidebar, Ctrl+J panel,
 * Ctrl+Alt+B secondary sidebar (Cmd instead of Ctrl on macOS). Mounted
 * once at the app shell.
 */
export function useWorkbenchShortcuts() {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey) || event.shiftKey) return;

      const key = event.key.toLowerCase();
      let area: WorkbenchArea | null = null;
      if (key === "b") area = event.altKey ? "secondarySidebar" : "primarySidebar";
      else if (key === "j" && !event.altKey) area = "panel";
      if (!area) return;

      event.preventDefault();
      toggleWorkbenchArea(area);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
