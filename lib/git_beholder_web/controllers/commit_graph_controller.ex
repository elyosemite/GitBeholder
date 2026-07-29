defmodule GitBeholderWeb.CommitGraphController do
  use GitBeholderWeb, :controller
  alias GitBeholder.CommitGraph

  def index(conn, %{"branch" => branch, "start_date" => start_date, "end_date" => end_date}) do
    case CommitGraph.build(conn.assigns.repository.path, branch, start_date, end_date) do
      {:ok, graph} ->
        json(conn, graph)

      {:error, reason} ->
        conn
        |> put_status(400)
        |> json(%{error: reason})
    end
  end

  def index(conn, _params) do
    conn
    |> put_status(400)
    |> json(%{error: "branch, start_date and end_date query params are required"})
  end
end
