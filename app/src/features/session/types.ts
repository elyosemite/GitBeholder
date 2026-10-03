import type { Repository } from "@/features/repositories";

export type DataScope =
  | "commits"
  | "status"
  | "branches"
  | "stashes"
  | "tags"
  | "sync"
  | "repositories"
  | "integrations"
  | "me";

export type MainView = "commits" | "graph";

export interface SessionState {
  repository: Repository | null;
  branch: string | null;
  inspectedCommit: string | null;
  diffFile: string | null;
  mainView: MainView;
  revisions: Record<DataScope, number>;
}

export interface SessionActions {
  selectRepository: (repo: Repository) => void;
  closeRepository: () => void;
  setBranch: (branch: string) => void;
  selectCommit: (hash: string) => void;
  openDiff: (path: string) => void;
  closeDiff: () => void;
  setMainView: (view: MainView) => void;
  invalidate: (...scopes: DataScope[]) => void;
}
