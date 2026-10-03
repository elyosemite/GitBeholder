defmodule GitBeholderWeb.RepositoryController do
  use GitBeholderWeb, :controller

  alias GitBeholder.Repositories

  def index(conn, %{"workspace_id" => workspace_id}) do
    case Integer.parse(workspace_id) do
      {workspace_id, ""} ->
        repositories = Enum.map(Repositories.list_repositories(workspace_id), &repository_json/1)
        json(conn, repositories)

      _ ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "invalid workspace id"})
    end
  end

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

  def open_local(conn, %{"workspace_id" => workspace_id, "path" => path}) do
    case Integer.parse(workspace_id) do
      {workspace_id, ""} ->
        case Repositories.open_local_repository(workspace_id, path) do
          {:ok, repository} ->
            conn
            |> put_status(:created)
            |> json(repository_json(repository))

          {:error, :invalid_path} ->
            conn
            |> put_status(:unprocessable_entity)
            |> json(%{errors: %{path: ["não é um repositório Git válido"]}})

          {:error, changeset} ->
            conn
            |> put_status(:unprocessable_entity)
            |> json(%{errors: GitBeholderWeb.ChangesetJSON.errors(changeset)})
        end

      _ ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "invalid workspace id"})
    end
  end

  def clone(conn, %{"workspace_id" => workspace_id, "url" => url, "destination" => destination}) do
    case Integer.parse(workspace_id) do
      {workspace_id, ""} ->
        case Repositories.clone_repository(workspace_id, url, destination) do
          {:ok, repository} ->
            conn
            |> put_status(:created)
            |> json(repository_json(repository))

          {:error, reason} when is_binary(reason) ->
            conn
            |> put_status(:unprocessable_entity)
            |> json(%{errors: %{url: [reason]}})

          {:error, changeset} ->
            conn
            |> put_status(:unprocessable_entity)
            |> json(%{errors: GitBeholderWeb.ChangesetJSON.errors(changeset)})
        end

      _ ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "invalid workspace id"})
    end
  end

  # Most recently opened repositories, for the launcher (`?limit=`, max 50).
  def recent(conn, params) do
    limit =
      case Integer.parse(Map.get(params, "limit", "10")) do
        {n, ""} when n in 1..50 -> n
        _ -> 10
      end

    json(conn, Enum.map(Repositories.list_recent_repositories(limit), &repository_json/1))
  end

  # Called whenever the app opens a repository (repository-scoped route,
  # so FetchRepository has already validated it).
  def opened(conn, _params) do
    {:ok, repository} = Repositories.mark_opened(conn.assigns.repository)
    json(conn, repository_json(repository))
  end

  defp repository_json(repository) do
    %{
      id: repository.id,
      name: repository.name,
      path: repository.path,
      workspace_id: repository.workspace_id,
      folder_id: repository.folder_id,
      last_opened_at: repository.last_opened_at
    }
  end
end
