defmodule GitBeholderWeb.GitBranchController do
  use GitBeholderWeb, :controller
  alias GitBeholder.{GitBranches, GitCheckout}

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

  def checkout(conn, %{"name" => name}) do
    case GitCheckout.checkout(conn.assigns.repository.path, name) do
      {:ok, output} ->
        json(conn, %{status: "ok", message: output})

      {:error, error_msg} ->
        conn
        |> put_status(:bad_request)
        |> json(%{status: "error", message: error_msg})
    end
  end
end
