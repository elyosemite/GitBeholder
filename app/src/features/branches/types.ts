export interface Branch {
  name: string;
  current: boolean;
  local: boolean;
  remote: string | null;
}
