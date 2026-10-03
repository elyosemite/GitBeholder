defmodule GitBeholderWeb.GitDiffController do
  use GitBeholderWeb, :controller
  alias GitBeholder.{GitCommitDetails, GitDiff}

  # The context sizes the diff view offers; anything else falls back to 3.
  @context_options [1, 3, 6, 12, 25, 50, 100]
  @default_context 3

  def index(conn, %{"hash" => hash}) do
    conn.assigns.repository.path
    |> GitDiff.file_changes(hash)
    |> respond(conn)
  end

  def show(conn, %{"hash" => hash, "path" => path} = params) do
    context = parse_context(params["context"])

    conn.assigns.repository.path
    |> GitDiff.file_diff(hash, path, context)
    |> respond(conn)
  end

  # Commit metadata for the commit panel (parents, author, committer, message).
  def details(conn, %{"hash" => hash}) do
    conn.assigns.repository.path
    |> GitCommitDetails.get(hash)
    |> respond(conn)
  end

  defp parse_context(value) when is_binary(value) do
    case Integer.parse(value) do
      {n, ""} when n in @context_options -> n
      _ -> @default_context
    end
  end

  defp parse_context(_value), do: @default_context

  defp respond({:ok, body}, conn), do: json(conn, body)

  defp respond({:error, reason}, conn) do
    conn
    |> put_status(400)
    |> json(%{error: reason})
  end
end
