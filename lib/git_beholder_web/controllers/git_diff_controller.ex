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

  def show(conn, %{"hash" => hash, "path" => path}) do
    case GitDiff.file_diff(conn.assigns.repository.path, hash, path) do
      {:ok, diff} ->
        json(conn, diff)

      {:error, reason} ->
        conn
        |> put_status(400)
        |> json(%{error: reason})
    end
  end
end
