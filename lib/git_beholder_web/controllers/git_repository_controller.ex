defmodule GitBeholderWeb.GitRepositoryController do
  use GitBeholderWeb, :controller
  import GitBeholderWeb.ControllerHelpers

  alias GitBeholder.GitRepository

  def index(conn, _params) do
    case GitRepository.root_path() do
      {:ok, repos, _root_dir} ->
        json(conn, %{status: "ok", repositories: repos})

      error ->
        respond_with_result(conn, error, :internal_server_error)
    end
  end
end
