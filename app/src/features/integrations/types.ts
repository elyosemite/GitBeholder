export interface AzureDevOpsConfig {
  org_url: string;
  project: string;
}

export interface Integration {
  id: number;
  provider: "azure_devops";
  config: AzureDevOpsConfig;
  enabled: boolean;
  auto_close_enabled: boolean;
  auto_close_target_state: string | null;
  repository_id: number;
}

export interface ConnectAzureDevOpsPayload {
  config: AzureDevOpsConfig;
  credentials: string;
}
