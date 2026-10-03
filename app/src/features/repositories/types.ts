export interface Workspace {
  id: number;
  name: string;
}

export interface Repository {
  id: number;
  name: string;
  path: string;
  workspace_id: number;
  folder_id: number | null;
  /** ISO timestamp of the last time the app opened it; null if never. */
  last_opened_at: string | null;
}
