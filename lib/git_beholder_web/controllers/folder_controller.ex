defmodule GitBeholderWeb.FolderController do
  use GitBeholderWeb, :controller

  alias GitBeholder.Repositories

  def index(conn, %{"workspace_id" => workspace_id}) do
    case Integer.parse(workspace_id) do
      {workspace_id, ""} ->
        folders = Enum.map(Repositories.list_folders(workspace_id), &folder_json/1)
        json(conn, %{folders: folders})

      _ ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "invalid workspace id"})
    end
  end

  def create(conn, params) do
    case Repositories.create_folder(params) do
      {:ok, folder} ->
        conn
        |> put_status(:created)
        |> json(folder_json(folder))

      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{errors: GitBeholderWeb.ChangesetJSON.errors(changeset)})
    end
  end

  defp folder_json(folder) do
    %{
      id: folder.id,
      name: folder.name,
      workspace_id: folder.workspace_id,
      parent_folder_id: folder.parent_folder_id
    }
  end
end
