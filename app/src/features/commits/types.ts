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
  author_email: string;
  timestamp: string;
  refs: CommitRef[];
}

/** git's status letter: Added, Modified, Deleted, Renamed, Copied, Type changed. */
export type FileStatus = "A" | "M" | "D" | "R" | "C" | "T";

export interface CommitFileChange {
  path: string;
  status: FileStatus;
  additions: number | null;
  deletions: number | null;
}

export interface CommitPerson {
  name: string;
  email: string;
  /** ISO 8601 */
  date: string;
}

export interface CommitCoAuthor {
  name: string;
  email: string;
}

export interface CommitStats {
  files_changed: number;
  insertions: number;
  deletions: number;
}

/** A branch containing the commit. */
export interface CommitBranch {
  /** "main" for a local branch, "origin/main" for a remote one. */
  name: string;
  remote: boolean;
  /** The local branch currently checked out. */
  current: boolean;
}

export interface CommitDetails {
  hash: string;
  /** Empty for a root commit, two for a merge. */
  parents: string[];
  author: CommitPerson;
  /** Differs from the author after a rebase, cherry-pick or amend by someone else. */
  committer: CommitPerson;
  /** From Co-authored-by trailers, e.g. an AI pair. */
  co_authors: CommitCoAuthor[];
  subject: string;
  /** Message body without the co-author trailers. */
  body: string;
  stats: CommitStats;
  branches: CommitBranch[];
}

/** Unchanged lines shown around each change in a diff (git -U). */
export const DIFF_CONTEXT_OPTIONS = [1, 3, 6, 12, 25, 50, 100] as const;
export type DiffContext = (typeof DIFF_CONTEXT_OPTIONS)[number];

export interface FileDiff {
  binary: boolean;
  /** Raw unified diff text (starting at `diff --git`); null for binary files. */
  patch: string | null;
}
