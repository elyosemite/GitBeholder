defmodule GitBeholderWeb.Plugs.FetchRepository do
  @moduledoc """
  Resolves `workspace_id`/`repository_id` path params into a validated
  `GitBeholder.Repositories.Repository`, assigned as `conn.assigns.repository`.

  Halts the connection with 404 (unknown repository / unavailable path) or
  400 (malformed ids) before any controller action runs.
  """

  import Plug.Conn
  import Phoenix.Controller, only: [json: 2]

  alias GitBeholder.Repositories

  def init(opts), do: opts

  def call(conn, _opts) do
    %{"workspace_id" => workspace_id, "repository_id" => repository_id} = conn.params

    with {workspace_id, ""} <- Integer.parse(workspace_id),
         {repository_id, ""} <- Integer.parse(repository_id),
         {:ok, repository} <- Repositories.fetch_repository(workspace_id, repository_id) do
      assign(conn, :repository, repository)
    else
      {:error, reason} ->
        halt_with_error(conn, :not_found, to_string(reason))

      _ ->
        halt_with_error(conn, :bad_request, "invalid workspace or repository id")
    end
  end

  defp halt_with_error(conn, status, message) do
    conn
    |> put_status(status)
    |> json(%{error: message})
    |> halt()
  end
end
