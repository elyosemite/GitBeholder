defmodule GitBeholderWeb.GitLogController do
  use GitBeholderWeb, :controller
  import GitBeholderWeb.ControllerHelpers

  alias GitBeholder.GitLog

  def index(conn, %{"repo_path" => path} = params) do
    limit = Map.get(params, "limit", "10") |> String.to_integer()

    case GitLog.list_commits(path, limit) do
      {:ok, commits} ->
        json(conn, commits)

      error ->
        respond_with_result(conn, error)
    end
  end
end
