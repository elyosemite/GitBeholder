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
}
