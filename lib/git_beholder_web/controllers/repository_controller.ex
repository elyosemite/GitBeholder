defmodule GitBeholderWeb.RepositoryController do
  use GitBeholderWeb, :controller

  alias GitBeholder.Repositories

  def create(conn, params) do
    case Repositories.create_repository(params) do
      {:ok, repository} ->
        conn
        |> put_status(:created)
        |> json(repository_json(repository))

      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{errors: GitBeholderWeb.ChangesetJSON.errors(changeset)})
    end
  end

  defp repository_json(repository) do
    %{
      id: repository.id,
      name: repository.name,
      path: repository.path,
      workspace_id: repository.workspace_id,
      folder_id: repository.folder_id
    }
  end
end
