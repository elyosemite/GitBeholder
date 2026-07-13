defmodule GitBeholderWeb.GitTagController do
  use GitBeholderWeb, :controller
  alias GitBeholder.GitTags

  def index(conn, _params) do
    case GitTags.list_tags(conn.assigns.repository.path) do
      {:ok, tags} ->
        json(conn, tags)

      {:error, reason} ->
        conn
        |> put_status(400)
        |> json(%{error: reason})
    end
  end
end
