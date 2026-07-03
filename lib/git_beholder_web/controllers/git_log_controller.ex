defmodule GitBeholderWeb.GitLogController do
  use GitBeholderWeb, :controller
  alias GitBeholder.GitLog

  def index(conn, params) do
    limit = Map.get(params, "limit", "10") |> String.to_integer()

    case GitLog.list_commits(conn.assigns.repository.path, limit) do
      {:ok, commits} ->
        json(conn, commits)

      {:error, reason} ->
        conn
        |> put_status(400)
        |> json(%{error: reason})
    end
  end
end
