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

export type DiffLineType = "hunk" | "context" | "added" | "removed";

export interface DiffLine {
  type: DiffLineType;
  old_line: number | null;
  new_line: number | null;
  content: string;
}

export interface FileDiff {
  binary: boolean;
  lines: DiffLine[];
}
