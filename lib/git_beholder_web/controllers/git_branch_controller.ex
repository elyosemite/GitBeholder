defmodule GitBeholderWeb.GitBranchController do
  use GitBeholderWeb, :controller
  alias GitBeholder.GitBranches

  def index(conn, _params) do
    case GitBranches.list_branches(conn.assigns.repository.path) do
      {:ok, branches} ->
        json(conn, branches)

      {:error, reason} ->
        conn
        |> put_status(400)
        |> json(%{error: reason})
    end
  end
end
