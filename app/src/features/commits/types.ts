import type { Platform } from "@/components/icons/brand-icons";

export type { Platform };

export interface CommitRef {
  name: string;
  type: "branch" | "tag";
  /** HEAD is on this branch */
  current?: boolean;
  /** branch exists in the local clone */
  local?: boolean;
  /** remote platform this ref is pushed to */
  platform?: Platform;
}

export interface Commit {
  hash: string;
  message: string;
  author: string;
  timestamp: string;
  refs: CommitRef[];
}
