defmodule GitBeholderWeb.GitRepositoryController do
  use GitBeholderWeb, :controller

  alias GitBeholder.GitRepository

  def index(conn, _params) do
    case GitRepository.root_path() do
      {:ok, repos, _root_dir} ->
        json(conn, %{status: "ok", repositories: repos})

      {:error, error_msg} ->
        conn
        |> put_status(:internal_server_error)
        |> json(%{status: "error", message: error_msg})
    end
  end
end
