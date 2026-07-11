defmodule GitBeholderWeb.GitStashController do
  use GitBeholderWeb, :controller
  alias GitBeholder.GitStash

  def index(conn, _params) do
    case GitStash.list_stashes(conn.assigns.repository.path) do
      {:ok, stashes} ->
        json(conn, stashes)

      {:error, reason} ->
        conn
        |> put_status(400)
        |> json(%{error: reason})
    end
  end
end
