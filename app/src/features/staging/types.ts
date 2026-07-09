export type FileStatus = "M" | "A" | "D" | "U";

export interface FileChange {
  path: string;
  status: FileStatus;
  staged: boolean;
}
