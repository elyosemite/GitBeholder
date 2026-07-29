export interface CommitActivityDay {
  date: string;
  commit_count: number;
  file_count: number;
  lines_changed: number;
  authors: string[];
  branches: string[];
}

export interface CommitActivity {
  buckets: CommitActivityDay[];
  truncated: boolean;
}
