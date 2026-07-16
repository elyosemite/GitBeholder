defmodule GitBeholder.Integrations.AzureDevOps do
  @moduledoc """
  Azure DevOps implementation of `GitBeholder.Integrations.WorkItemProvider`.

  Only `list_types/1` is implemented in this slice — it powers both
  "Test connection" and the future work item type picker. The
  remaining callbacks are stubbed until the search/link/transition
  slices land.
  """

  @behaviour GitBeholder.Integrations.WorkItemProvider

  alias GitBeholder.Integrations.WorkItemProvider

  @api_version "7.1"

  @impl WorkItemProvider
  def list_types(%{config: config, credentials: pat}) do
    org_url = Map.fetch!(config, "org_url")
    project = Map.fetch!(config, "project")

    url = build_url(org_url, project, "_apis/wit/workitemtypes")

    :get
    |> http_client().request(url, headers(pat), "")
    |> handle_response()
  end

  @impl WorkItemProvider
  def search_items(_connection, _filters), do: {:error, :not_implemented}

  @impl WorkItemProvider
  def get_item(_connection, _external_id), do: {:error, :not_implemented}

  @impl WorkItemProvider
  def transition_item(_connection, _external_id, _target_state), do: {:error, :not_implemented}

  @impl WorkItemProvider
  def link_commit(_connection, _external_id, _commit_sha), do: {:error, :not_implemented}

  defp build_url(org_url, project, path) do
    org_url
    |> String.trim_trailing("/")
    |> Kernel.<>("/#{URI.encode(project)}/#{path}?api-version=#{@api_version}")
  end

  defp headers(pat) do
    encoded = Base.encode64(":" <> pat)
    [{"authorization", "Basic #{encoded}"}, {"accept", "application/json"}]
  end

  defp handle_response({:ok, %{status: 200, body: body}}) do
    case Jason.decode(body) do
      {:ok, %{"value" => types}} -> {:ok, types}
      {:error, _reason} -> {:error, :invalid_response}
    end
  end

  defp handle_response({:ok, %{status: status}}) when status in [401, 203] do
    {:error, :invalid_token}
  end

  defp handle_response({:ok, %{status: 404}}), do: {:error, :not_found}
  defp handle_response({:ok, %{status: _status}}), do: {:error, :connection_failed}
  defp handle_response({:error, _reason}), do: {:error, :connection_failed}

  defp http_client do
    Application.get_env(
      :git_beholder,
      :integrations_http_client,
      GitBeholder.Integrations.FinchClient
    )
  end
end
