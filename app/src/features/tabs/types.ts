import type { Repository } from "@/features/repositories";

/**
 * A top-level tab. Repository tabs show the Git workspace for one repo;
 * "new" tabs are the launcher (pick a recent repository) and turn into a
 * repository tab in place once one is chosen; the settings tab is a
 * singleton. Boards and issues from future integrations become new kinds.
 */
export type Tab =
  | { id: string; kind: "repository"; repository: Repository }
  | { id: string; kind: "new" }
  | { id: "settings"; kind: "settings" };

export interface TabsState {
  tabs: Tab[];
  activeId: string | null;
}
