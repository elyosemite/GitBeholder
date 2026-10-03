import type { Repository } from "@/features/repositories";

/**
 * A top-level tab. Repository tabs show the Git workspace for one repo;
 * the settings tab is a singleton. Boards and issues from future
 * integrations become new kinds here.
 */
export type Tab =
  | { id: string; kind: "repository"; repository: Repository }
  | { id: "settings"; kind: "settings" };

export interface TabsState {
  tabs: Tab[];
  activeId: string | null;
}
