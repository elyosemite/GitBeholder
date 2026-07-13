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
  description: string;
  author: string;
  timestamp: string;
  refs: CommitRef[];
}

export interface CommitFileChange {
  path: string;
  additions: number | null;
  deletions: number | null;
}

export interface FileDiff {
  binary: boolean;
  /** Raw unified diff text (starting at `diff --git`); null for binary files. */
  patch: string | null;
}
