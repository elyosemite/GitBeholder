defmodule GitBeholderWeb.CommitActivityController do
  use GitBeholderWeb, :controller
  alias GitBeholder.CommitActivity

  def index(conn, %{"branch" => branch, "start_date" => start_date, "end_date" => end_date}) do
    case CommitActivity.build(conn.assigns.repository.path, branch, start_date, end_date) do
      {:ok, activity} ->
        json(conn, activity)

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
