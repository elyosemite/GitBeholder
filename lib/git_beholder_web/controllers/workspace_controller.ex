defmodule GitBeholderWeb.WorkspaceController do
  use GitBeholderWeb, :controller

  alias GitBeholder.Repositories

  def index(conn, _params) do
    workspaces = Enum.map(Repositories.list_workspaces(), &workspace_json/1)
    json(conn, %{workspaces: workspaces})
  end

  def create(conn, params) do
    case Repositories.create_workspace(params) do
      {:ok, workspace} ->
        conn
        |> put_status(:created)
        |> json(workspace_json(workspace))

      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{errors: GitBeholderWeb.ChangesetJSON.errors(changeset)})
    end
  end

  defp workspace_json(workspace) do
    %{id: workspace.id, name: workspace.name}
  end
end
