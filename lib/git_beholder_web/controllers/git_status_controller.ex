defmodule GitBeholderWeb.GitStatusController do
  use GitBeholderWeb, :controller
  alias GitBeholder.GitStatus

  def index(conn, _params) do
    case GitStatus.list_changes(conn.assigns.repository.path) do
      {:ok, changes} ->
        json(conn, changes)

      {:error, reason} ->
        conn
        |> put_status(400)
        |> json(%{error: reason})
    end
  end
end
