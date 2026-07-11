import type { Repository } from "@/features/repositories";

export type DataScope =
  | "commits"
  | "status"
  | "branches"
  | "stashes"
  | "tags"
  | "sync"
  | "repositories";

export interface SessionState {
  repository: Repository | null;
  branch: string | null;
  revisions: Record<DataScope, number>;
}

export interface SessionApi extends SessionState {
  selectRepository: (repo: Repository) => void;
  setBranch: (branch: string) => void;
  invalidate: (...scopes: DataScope[]) => void;
}
