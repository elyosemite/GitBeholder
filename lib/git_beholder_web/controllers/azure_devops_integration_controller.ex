defmodule GitBeholderWeb.AzureDevOpsIntegrationController do
  use GitBeholderWeb, :controller

  alias GitBeholder.Integrations

  def create(conn, params) do
    case Integrations.connect(conn.assigns.repository.id, put_provider(params)) do
      {:ok, integration} ->
        conn
        |> put_status(:created)
        |> json(integration_json(integration))

      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{errors: GitBeholderWeb.ChangesetJSON.errors(changeset)})
    end
  end

  def test(conn, params) do
    case Integrations.test_connection(put_provider(params)) do
      {:ok, types} ->
        json(conn, %{types: types})

      {:error, reason} ->
        render_provider_error(conn, reason)
    end
  end

  def show(conn, _params) do
    case Integrations.get_connection(conn.assigns.repository.id) do
      {:ok, integration} ->
        json(conn, integration_json(integration))

      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "not connected"})
    end
  end

  def delete(conn, _params) do
    case Integrations.disconnect(conn.assigns.repository.id) do
      {:ok, _integration} ->
        send_resp(conn, :no_content, "")

      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "not connected"})
    end
  end

  defp put_provider(params), do: Map.put(params, "provider", "azure_devops")

  defp integration_json(integration) do
    %{
      id: integration.id,
      provider: integration.provider,
      config: integration.config,
      enabled: integration.enabled,
      auto_close_enabled: integration.auto_close_enabled,
      auto_close_target_state: integration.auto_close_target_state,
      repository_id: integration.repository_id
    }
  end

  defp render_provider_error(conn, :invalid_token) do
    conn
    |> put_status(:unprocessable_entity)
    |> json(%{error: "the Azure DevOps personal access token is invalid or expired"})
  end

  defp render_provider_error(conn, :connection_failed) do
    conn
    |> put_status(:unprocessable_entity)
    |> json(%{
      error: "could not reach Azure DevOps — check the organization URL and network connection"
    })
  end

  defp render_provider_error(conn, :not_found) do
    conn
    |> put_status(:unprocessable_entity)
    |> json(%{error: "Azure DevOps project not found — check the organization URL and project name"})
  end

  defp render_provider_error(conn, :invalid_response) do
    conn
    |> put_status(:bad_gateway)
    |> json(%{error: "Azure DevOps returned an unexpected response"})
  end

  defp render_provider_error(conn, :unsupported_provider) do
    conn
    |> put_status(:bad_request)
    |> json(%{error: "unsupported provider"})
  end

  defp render_provider_error(conn, _reason) do
    conn
    |> put_status(:unprocessable_entity)
    |> json(%{error: "could not test the connection"})
  end
end
