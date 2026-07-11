defmodule GitBeholderWeb.GitDiffController do
  use GitBeholderWeb, :controller
  alias GitBeholder.GitDiff

  def index(conn, %{"hash" => hash}) do
    case GitDiff.file_changes(conn.assigns.repository.path, hash) do
      {:ok, changes} ->
        json(conn, changes)

      {:error, reason} ->
        conn
        |> put_status(400)
        |> json(%{error: reason})
    end
  end
end
