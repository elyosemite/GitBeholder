defmodule GitBeholderWeb.GitPullController do
  use GitBeholderWeb, :controller
  alias GitBeholder.GitPull

  def create(conn, _params) do
    case GitPull.pull(conn.assigns.repository.path) do
      {:ok, output} ->
        json(conn, %{status: "ok", message: output})

      {:error, error_msg} ->
        conn
        |> put_status(:bad_request)
        |> json(%{status: "error", message: error_msg})
    end
  end
end
