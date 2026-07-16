defmodule GitBeholder.Integrations.WorkItemProvider do
  @moduledoc """
  Behaviour implemented by every work item provider (Azure DevOps now,
  future providers such as GitHub Issues, Jira, and Linear) so the rest
  of GitBeholder can search, link, and transition work items without
  knowing which provider a repository is connected to.
  """

  @typedoc "Provider-specific config (e.g. Org URL, Project) plus the decrypted credential."
  @type connection :: %{config: map(), credentials: binary()}

  @callback list_types(connection) :: {:ok, list(map())} | {:error, term()}
  @callback search_items(connection, filters :: map()) :: {:ok, list(map())} | {:error, term()}
  @callback get_item(connection, external_id :: String.t()) :: {:ok, map()} | {:error, term()}
  @callback transition_item(connection, external_id :: String.t(), target_state :: String.t()) ::
              :ok | {:error, term()}
  @callback link_commit(connection, external_id :: String.t(), commit_sha :: String.t()) ::
              :ok | {:error, term()}
end
