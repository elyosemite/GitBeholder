defmodule GitBeholderWeb.GitLogController do
  use GitBeholderWeb, :controller
  alias GitBeholder.GitLog

  def index(conn, %{"branch" => branch} = params) do
    limit = Map.get(params, "limit", "20") |> String.to_integer()

    case GitLog.list_commits(conn.assigns.repository.path, branch, limit) do
      {:ok, commits} ->
        json(conn, commits)

      {:error, reason} ->
        conn
        |> put_status(400)
        |> json(%{error: reason})
    end
  end

  def index(conn, _params) do
    conn
    |> put_status(400)
    |> json(%{error: "branch query param is required"})
  end
end
